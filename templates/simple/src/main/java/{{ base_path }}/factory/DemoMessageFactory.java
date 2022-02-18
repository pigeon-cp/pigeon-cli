package {{ base_package }}.factory.message;

import pigeon.core.entity.core.Message;
import pigeon.core.repo.factory.MessageFactory;
import {{ base_package }}.entity.DemoMessage;
import org.pf4j.Extension;

/**
 * @author {{ author }}
 * @since {{ version }}
 */
@Extension
public class DemoMessageFactory implements MessageFactory {
    @Override
    public Message create(Long id, Criteria criteria) {
        return new DemoMessage(id)
    }

    @Override
    public boolean match(Long id, Criteria o) {
        return Objects.equals(o.getSpType(), 'DEMO');
    }
}
