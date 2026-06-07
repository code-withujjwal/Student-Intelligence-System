package com.quizapp.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class TenantFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public TenantFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String tenantId = jwtService.extractClaim(token, claims -> claims.get("tenantId", String.class));
                
                if (tenantId != null) {
                    TenantContext.setCurrentTenant(tenantId);
                }
            } else {
                // If it's a public endpoint or dev bypass, we might use a default tenant
                String headerTenant = request.getHeader("X-Tenant-ID");
                if (headerTenant != null) {
                    TenantContext.setCurrentTenant(headerTenant);
                } else {
                    TenantContext.setCurrentTenant("default_tenant");
                }
            }
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
