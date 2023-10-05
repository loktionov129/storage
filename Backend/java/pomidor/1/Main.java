import java.util.Random;

public class Main {
    public static void main(String[] args) {
        OrderRepository orderRepository = new OrderRepository();
        EmailService emailService = new EmailService();
        MqPublisher mqPublisher = new MqPublisher();
        OrderController orderController = new OrderController(orderRepository, emailService, mqPublisher);
        
        for(int i = 0; i < 10; i++){
            orderController.httpPost("{this_is_a_order_json}");
        }
    }

    static class OrderController {
        private OrderRepository orderRepository;
        private EmailService emailService;
        private MqPublisher mqPublisher;

        public OrderController(OrderRepository orderRepository, EmailService emailService, MqPublisher mqPublisher) {
            this.orderRepository = orderRepository;
            this.emailService = emailService;
            this.mqPublisher = mqPublisher;
        }

        public void httpPost(Object order) {
            GenericResult<Integer> newOrderId = orderRepository.save(order);
            GenericResult<Integer> newMailId = emailService.send("customer@mail.com", "New order", "Any info about order");
            GenericResult<Integer> newMessageId = mqPublisher.publish(newOrderId.result, order);
            
            System.out.println(
                String.format("{newOrderId: %d, \tnewMailId: %d, \tnewMessageId: %d}",
                    newOrderId.result, newMailId.result, newMessageId.result));
        }
    }

    static class OrderRepository {
        public GenericResult<Integer> save(Object order) {
            boolean isSuccess = new Random().nextInt(2) == 1;
            if (!isSuccess) {
                // База легла, не удалось сохранить заказ
                return GenericResult.error("DB_SAVE_ERROR");
            }
            int newOrderId = new Random().nextInt(1111) + 1111;
            return GenericResult.success(newOrderId);
        }
    }

    static class EmailService {
        public GenericResult<Integer> send(String to, String title, String message) {
            boolean isSuccess = new Random().nextInt(2) == 1;
            if (!isSuccess) {
                // Закончились семки, голуби за бесплатно не отправляют письма
                return GenericResult.error("EMAIL_SEND_ERROR");
            }
            int newMailId = new Random().nextInt(1111) + 1111;
            return GenericResult.success(newMailId);
        }
    }

    static class MqPublisher {
        public GenericResult<Integer> publish(Integer orderId, Object order) {
            boolean isSuccess = new Random().nextInt(2) == 1;
            if (!isSuccess) {
                // Не судьба, кролика подстрелили охотники
                return GenericResult.error("MQ_PUBLISH_ERROR");
            }
            int newMessageId = new Random().nextInt(1111) + 1111;
            return GenericResult.success(newMessageId);
        }
    }

    static class GenericResult<T> {
        public T result;
        public boolean isSuccess;
        public String message;

        public static <T> GenericResult<T> error(String errorMessage) {
            return new GenericResult<T>() {{
                isSuccess = false;
                message = errorMessage;
            }};
        }

        public static <T> GenericResult<T> success(T successResult) {
            return new GenericResult<T>() {{
                isSuccess = true;
                result = successResult;
            }};
        }
    }
}
