package {{ base_package }}.spring;

import {{ base_package }}.Plugin;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * @author {{ author }}
 * @since {{ version }}
 */
@Configuration
@ComponentScan(basePackageClasses = Plugin.class)
public class SpringConfiguration {
}
