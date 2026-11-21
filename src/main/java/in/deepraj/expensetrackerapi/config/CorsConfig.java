package in.deepraj.expensetrackerapi.config;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

	@Value("${frontend.url:}")
	private String frontendUrl;

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();

		List<String> allowedOrigins = new ArrayList<>(Arrays.asList(
				"http://localhost:5173",
				"http://localhost:3000"));

		// FRONTEND_URL may list several origins, comma-separated
		// (e.g. "https://my-app.onrender.com,https://me.github.io"). Origins have no path or trailing slash.
		if (frontendUrl != null) {
			for (String origin : frontendUrl.split(",")) {
				String trimmed = origin.trim().replaceAll("/+$", "");
				if (!trimmed.isEmpty() && !allowedOrigins.contains(trimmed)) {
					allowedOrigins.add(trimmed);
				}
			}
		}

		configuration.setAllowedOrigins(allowedOrigins);
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
		configuration.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}
}
