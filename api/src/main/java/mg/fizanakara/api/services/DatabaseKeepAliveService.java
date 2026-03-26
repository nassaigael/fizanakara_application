package mg.fizanakara.api.services;

import mg.fizanakara.api.repository.KeepAliveRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class DatabaseKeepAliveService {

    private static final Logger log = LoggerFactory.getLogger(DatabaseKeepAliveService.class);

    private final KeepAliveRepository keepAliveRepository;

    public DatabaseKeepAliveService(KeepAliveRepository keepAliveRepository) {
        this.keepAliveRepository = keepAliveRepository;
    }

    @Scheduled(fixedRate = 10 * 60 * 1000)
    public void keepDatabaseAlive() {
        try {
            keepAliveRepository.pingDatabase();
            log.info("Keep-alive ping envoyé à la base PostgreSQL Aiven → DB reste awake");
        } catch (Exception e) {
            log.error("Échec du keep-alive ping vers PostgreSQL", e);
        }
    }
}