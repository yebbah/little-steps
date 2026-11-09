package app.littlesteps.tenantprobe;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantProbeRepository extends JpaRepository<TenantProbe, UUID> {

}
