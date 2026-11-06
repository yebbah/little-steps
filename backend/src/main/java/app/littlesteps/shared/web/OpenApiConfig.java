package app.littlesteps.shared.web;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Header of the generated {@code openapi.json}. The server is the relative root, so the file does
 * not depend on the host or port it was generated on and stays stable between builds.
 */
@Configuration(proxyBeanMethods = false)
class OpenApiConfig {

	@Bean
	OpenAPI littleStepsOpenApi() {
		return new OpenAPI().info(new Info().title("LittleSteps API").version("v1"))
			.addServersItem(new Server().url("/"));
	}

}
