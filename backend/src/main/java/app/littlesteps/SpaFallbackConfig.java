package app.littlesteps;

import java.io.IOException;
import java.time.Duration;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

/**
 * Serves the built PWA from the classpath {@code static/} folder. A GET for a path that matches no
 * file, is not under {@code /api} or {@code /actuator} and has no file extension returns
 * {@code index.html}, so client-side routes survive a reload or a deep link. Everything else that
 * is unknown stays 404.
 */
@Configuration(proxyBeanMethods = false)
class SpaFallbackConfig implements WebMvcConfigurer {

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		// Hashed build output never changes under the same name: cache it for a year.
		registry.addResourceHandler("/assets/**")
			.addResourceLocations("classpath:/static/assets/")
			.setCacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable());
		// Everything else (index.html, sw.js, the SPA fallback) is revalidated every time, so a
		// redeploy is never hidden behind a stale shell or service worker.
		registry.addResourceHandler("/**")
			.addResourceLocations("classpath:/static/")
			.setCacheControl(CacheControl.noCache())
			.resourceChain(true)
			.addResolver(new SpaResolver());
	}

	static final class SpaResolver extends PathResourceResolver {

		@Override
		protected Resource getResource(String resourcePath, Resource location) throws IOException {
			Resource found = super.getResource(resourcePath, location);
			if (found != null || !isClientRoute(resourcePath)) {
				return found;
			}
			Resource index = location.createRelative("index.html");
			return (index.exists() && index.isReadable()) ? index : null;
		}

		static boolean isClientRoute(String path) {
			String p = path.startsWith("/") ? path.substring(1) : path;
			if (p.equals("api") || p.startsWith("api/") || p.equals("actuator") || p.startsWith("actuator/")
					|| p.equals("v3") || p.startsWith("v3/")) {
				return false;
			}
			String last = p.substring(p.lastIndexOf('/') + 1);
			return !last.contains(".");
		}

	}

}
