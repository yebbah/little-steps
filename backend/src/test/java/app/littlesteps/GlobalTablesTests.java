package app.littlesteps;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import org.hibernate.annotations.TenantId;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AnnotationTypeFilter;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.data.jpa.repository.Query;

/** AD-2: an entity without {@code @TenantId} must be listed in GLOBAL_TABLES.md, and native queries filter on family_id. */
class GlobalTablesTests {

	private static final Path MAIN_SOURCES = Path.of("src", "main", "java");

	@Test
	void everyEntityWithoutTenantIdIsListedAsAGlobalTable() throws Exception {
		Set<String> listed = listedTables(Files.readString(Path.of("GLOBAL_TABLES.md")));
		assertThat(listed).containsExactlyInAnyOrder("families", "caregivers", "caregiver_membership");
		Set<String> unlisted = unlistedGlobalEntities(entities(), listed);
		assertThat(unlisted).as("entities without @TenantId that are missing from GLOBAL_TABLES.md").isEmpty();
	}

	@Test
	void theCheckFindsAnUnlistedEntityWithoutTenantId() {
		assertThat(unlistedGlobalEntities(List.of(Unlisted.class), Set.of("families"))).containsExactly("unlisted_thing");
		assertThat(unlistedGlobalEntities(List.of(Scoped.class), Set.of())).isEmpty();
		assertThat(unlistedGlobalEntities(List.of(InheritsTenant.class), Set.of())).isEmpty();
	}

	@Test
	void everyNativeQueryFiltersOnFamilyId() throws Exception {
		assertThat(nativeQueriesWithoutFamilyId(allClasses())).isEmpty();
		try (var files = Files.walk(MAIN_SOURCES)) {
			for (Path file : files.filter(f -> f.toString().endsWith(".java")).toList()) {
				assertThat(Files.readString(file)).as(file + " builds a native query in code, which cannot be checked")
					.doesNotContain("createNativeQuery(")
					.doesNotContain("JdbcTemplate")
					.doesNotContain("JdbcClient");
			}
		}
	}

	@Test
	void theNativeQueryCheckFindsAQueryWithoutFamilyId() {
		assertThat(nativeQueriesWithoutFamilyId(List.of(BadRepo.class))).hasSize(2);
		assertThat(nativeQueriesWithoutFamilyId(List.of(GoodRepo.class))).isEmpty();
	}

	static Set<String> listedTables(String markdown) {
		String section = markdown.split("## Listed tables", 2)[1].split("\n## ", 2)[0];
		Set<String> tables = new TreeSet<>();
		Matcher m = Pattern.compile("^\\| `([a-z_]+)` \\|", Pattern.MULTILINE).matcher(section);
		while (m.find()) {
			tables.add(m.group(1));
		}
		return tables;
	}

	static Set<String> unlistedGlobalEntities(List<Class<?>> entities, Set<String> listed) {
		Set<String> missing = new TreeSet<>();
		for (Class<?> entity : entities) {
			boolean tenantScoped = false;
			for (Class<?> c = entity; c != null && c != Object.class; c = c.getSuperclass()) {
				tenantScoped |= java.util.Arrays.stream(c.getDeclaredFields())
					.anyMatch(f -> f.isAnnotationPresent(TenantId.class));
			}
			String table = tableName(entity);
			if (!tenantScoped && !listed.contains(table)) {
				missing.add(table);
			}
		}
		return missing;
	}

	static String tableName(Class<?> entity) {
		Table table = entity.getAnnotation(Table.class);
		if (table != null && !table.name().isEmpty()) {
			return table.name();
		}
		return entity.getSimpleName().replaceAll("([a-z])([A-Z])", "$1_$2").toLowerCase(Locale.ROOT);
	}

	static List<String> nativeQueriesWithoutFamilyId(List<Class<?>> classes) {
		List<String> bad = new java.util.ArrayList<>();
		for (Class<?> type : classes) {
			for (var method : type.getDeclaredMethods()) {
				Query query = method.getAnnotation(Query.class);
				if (query != null && query.nativeQuery() && !query.value().toLowerCase(Locale.ROOT).contains("family_id")) {
					bad.add(type.getName() + "#" + method.getName());
				}
				NativeQuery nq = method.getAnnotation(NativeQuery.class);
				if (nq != null && !nq.value().toLowerCase(Locale.ROOT).contains("family_id")) {
					bad.add(type.getName() + "#" + method.getName());
				}
			}
		}
		return bad;
	}

	private static List<Class<?>> entities() throws ClassNotFoundException {
		var scanner = new ClassPathScanningCandidateComponentProvider(false);
		scanner.addIncludeFilter(new AnnotationTypeFilter(Entity.class));
		List<Class<?>> found = new java.util.ArrayList<>();
		for (BeanDefinition def : scanner.findCandidateComponents("app.littlesteps")) {
			Class<?> type = Class.forName(def.getBeanClassName());
			if (!type.getName().startsWith("app.littlesteps.GlobalTablesTests")) {
				found.add(type);
			}
		}
		return found;
	}

	private static List<Class<?>> allClasses() throws ClassNotFoundException {
		var scanner = new ClassPathScanningCandidateComponentProvider(false) {
			@Override
			protected boolean isCandidateComponent(org.springframework.beans.factory.annotation.AnnotatedBeanDefinition d) {
				return true;
			}
		};
		scanner.addIncludeFilter((reader, factory) -> true);
		List<Class<?>> found = new java.util.ArrayList<>();
		for (BeanDefinition def : scanner.findCandidateComponents("app.littlesteps")) {
			if (!def.getBeanClassName().startsWith("app.littlesteps.GlobalTablesTests")) {
				found.add(Class.forName(def.getBeanClassName()));
			}
		}
		return found;
	}

	// Not @Entity: the fixtures must not be scanned as real entities.
	@Table(name = "unlisted_thing")
	static class Unlisted {

	}

	@Table(name = "scoped_thing")
	static class Scoped {

		@TenantId
		java.util.UUID familyId;

	}

	static class TenantBase {

		@TenantId
		java.util.UUID familyId;

	}

	@Table(name = "inherits_tenant")
	static class InheritsTenant extends TenantBase {

	}

	interface BadRepo {

		@Query(value = "select * from tenant_probe", nativeQuery = true)
		List<Object> a();

		@NativeQuery("delete from tenant_probe")
		void b();

	}

	interface GoodRepo {

		@Query(value = "select * from tenant_probe where family_id = :f", nativeQuery = true)
		List<Object> a(java.util.UUID f);

	}

}
