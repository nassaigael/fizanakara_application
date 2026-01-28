package mg.fizanakara.api.configs;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class SequenceInitializer {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void initializeSequences() {
        jdbcTemplate.execute("CREATE SEQUENCE IF NOT EXISTS admin_seq START WITH 2 INCREMENT BY 1");
        jdbcTemplate.execute("CREATE SEQUENCE IF NOT EXISTS mbr_seq START WITH 1 INCREMENT BY 1");
    }
}