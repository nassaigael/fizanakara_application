package mg.fizanakara.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull; // ✅ AJOUT
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(CustomUserDetailsService userDetailsService, JwtUtil jwtUtil) {
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,  // ✅ AJOUT @NonNull
            @NonNull HttpServletResponse response, // ✅ AJOUT @NonNull
            @NonNull FilterChain filterChain      // ✅ AJOUT @NonNull
    ) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        String token = null;
        
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
        }

        if (token != null && jwtUtil.validateToken(token)) {
            String subject = jwtUtil.getSubject(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(subject);

            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
                log.debug("Auth set pour user : {}", subject);
            }
        } else if (token != null) {
            log.warn("Token invalide pour {} : {}", request.getRequestURI(), jwtUtil.getSubject(token));
        }
        filterChain.doFilter(request, response);
    }
}