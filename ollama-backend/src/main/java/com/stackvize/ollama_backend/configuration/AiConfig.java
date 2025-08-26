package com.stackvize.ollama_backend.configuration;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {
    @Bean
    ChatClient chatClient(ChatModel model) {
        return ChatClient.builder(model).build();
    }
}