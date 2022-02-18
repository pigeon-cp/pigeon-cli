package {{ base_package }}.entity.core.message;

import pigeon.core.data.MessageDO;
import pigeon.core.entity.core.Message;

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
    protected void doDelivery() throws Exception {
        MessageDO data = this.data();
        System.out.printf("To %s.\n%s\n%s\n  - by %s",
                data.getTarget(),
                data.getTitle(),
                data.getContent(),
                data.getSender()
        );
    }
}
