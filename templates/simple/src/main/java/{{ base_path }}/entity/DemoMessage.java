package {{ base_package }}.entity;

import pigeon.core.data.MessageDO;
import pigeon.core.entity.core.Message;
import pigeon.core.entity.core.sp.MessageServiceProvider;

/**
 * Demo Message
 *
 * @author {{ author }}
 * @since {{ version }}
 */
public class DemoMessage extends Message {
    public DemoMessage(Long id) {
        super(id);
    }

    @Override
    public boolean isRealTime() {
        return true;
    }

    @Override
    protected void doDelivery() {
        MessageDO data = this.data();
        System.out.printf("To %s.\n%s\n%s\n  - by %s",
                data.getTarget(),
                data.getTitle(),
                data.getContent(),
                data.getSender()
        );
    }

    @Override
    public MessageServiceProvider getServiceProvider() {
        return null;
    }
}
