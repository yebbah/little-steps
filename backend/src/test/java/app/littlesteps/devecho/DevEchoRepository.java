package app.littlesteps.devecho;

import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

@Profile("test")
public interface DevEchoRepository extends JpaRepository<DevEcho, UUID> {

}
