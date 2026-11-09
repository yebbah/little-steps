package app.littlesteps.shared.persistence;

import org.hibernate.cfg.AvailableSettings;
import org.springframework.boot.hibernate.autoconfigure.HibernatePropertiesCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Registers the tenant resolver with Hibernate. */
@Configuration(proxyBeanMethods = false)
class TenantConfiguration {

	@Bean
	FamilyTenantResolver familyTenantResolver() {
		return new FamilyTenantResolver();
	}

	@Bean
	HibernatePropertiesCustomizer tenantResolverCustomizer(FamilyTenantResolver resolver) {
		return properties -> properties.put(AvailableSettings.MULTI_TENANT_IDENTIFIER_RESOLVER, resolver);
	}

}
