package {{ base_package }};

import pigeon.core.entity.core.PigeonPlugin;
import {{ base_package }}.spring.SpringConfiguration;
import org.pf4j.PluginWrapper;

/**
 * @author {{ author }}
 * @since {{ version }}
 */
public class Plugin extends PigeonPlugin {
    public Plugin(PluginWrapper wrapper) {
        super(wrapper);
    }

    @Override
    protected Class<?> getSpringConfigurationClass() {
        return SpringConfiguration.class;
    }
}
