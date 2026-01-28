package mg.fizanakara.api.exceptions;

public class ContributionNotFoundException extends RuntimeException {
    public ContributionNotFoundException(String message) {
        super(message);
    }
}
