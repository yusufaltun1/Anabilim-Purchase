package com.anabilim.purchase.config;

import com.azure.identity.ClientSecretCredential;
import com.azure.identity.ClientSecretCredentialBuilder;
import com.microsoft.graph.serviceclient.GraphServiceClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MicrosoftGraphConfig {

    @Value("${microsoft.graph.client-id}")
    private String clientId;

    @Value("${microsoft.graph.client-secret}")
    private String clientSecret;

    @Value("${microsoft.graph.tenant-id}")
    private String tenantId;

    @Bean
    public GraphServiceClient graphServiceClient() throws Exception {
        final String[] scopes = new String[] { "https://graph.microsoft.com/.default" };

        final ClientSecretCredential credential = new ClientSecretCredentialBuilder()
                .clientId(clientId)
                .tenantId(tenantId)
                .clientSecret(clientSecret)
                .build();

        if (null == scopes || null == credential) {
            throw new Exception("Unexpected error");
        }

        final GraphServiceClient graphClient = new GraphServiceClient(credential, scopes);
        return graphClient;
    }
} 