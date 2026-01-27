package mg.fizanakara.api.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ChildrenNotFoundException extends RuntimeException {
    public ChildrenNotFoundException(String message) {
        super(message);
    }
}
