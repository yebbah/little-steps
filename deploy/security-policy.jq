# Blocking policy for one Grype JSON report (AD-25). Pure function of its inputs, so tests can
# run it on fixtures without tools or network.
#
# input:   a Grype report (`grype -o json`)
# --argjson kev         array of CVE ids in the CISA KEV catalog
# --argjson exceptions  array of VALIDATED exception entries ({cve, reason, mitigation, expires})
#
# A finding blocks when: a CVE it maps to is in KEV, or its highest CVSS base score is 7.0 or more,
# or it has no score at all and Grype rates it High or Critical (unknown is treated as worst case).
# A blocking finding is excepted only when it has no fixed version and an exception lists one of
# its ids. Everything else is a warning (below 7.0, not in KEV).

def ids: ([.vulnerability.id] + [(.relatedVulnerabilities // [])[].id]) | unique;
def scores:
  [ (.vulnerability.cvss // [])[].metrics.baseScore,
    ((.relatedVulnerabilities // [])[] | (.cvss // [])[].metrics.baseScore) ]
  | map(select(. != null));

[ (.matches // [])[]
  | ids as $ids
  | (scores | if length == 0 then null else max end) as $cvss
  | ([$ids[] | select(. as $i | $kev | index($i))] | length > 0) as $isKev
  | ((.vulnerability.fix.versions // []) | map(select(. != ""))) as $fixed
  | ((.vulnerability.severity // "") | ascii_downcase) as $sev
  | ($isKev or ($cvss != null and $cvss >= 7.0)
      or ($cvss == null and ($sev == "high" or $sev == "critical"))) as $blocking
  | ([$exceptions[] | select(.cve as $c | $ids | index($c))] | first) as $exc
  | { package: .artifact.name,
      version: .artifact.version,
      cve: (([$ids[] | select(startswith("CVE-"))] | first) // .vulnerability.id),
      ids: $ids,
      kev: $isKev,
      cvss: $cvss,
      severity: .vulnerability.severity,
      fixed: $fixed,
      status: (if ($blocking | not) then "warn"
               elif ($fixed | length) == 0 and $exc != null then "excepted"
               else "block" end),
      exceptionNote: (if $blocking and ($fixed | length) > 0 and $exc != null
                      then "exception ignored: a fixed version exists, upgrade instead"
                      else null end),
      exceptionExpires: (if $exc != null then $exc.expires else null end) }
] | unique_by([.package, .version, .cve])
