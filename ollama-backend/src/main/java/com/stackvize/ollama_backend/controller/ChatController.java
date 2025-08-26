package com.stackvize.ollama_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;

import com.stackvize.ollama_backend.dtos.ChatRequest;
import com.stackvize.ollama_backend.dtos.Message;
import com.stackvize.ollama_backend.dtos.Message.Role;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.ArrayList;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin
public class ChatController {

    private final ChatClient chatClient;

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> stream(@Valid @RequestBody ChatRequest req) {
        return chatClient.prompt()
                .messages(convert(req.messages()))
                .stream()
                .content()
                .map(tok -> ServerSentEvent.<String>builder().event("token").data(tok).build())
                // <<< CAPTURA ERROS E CONVERTE EM EVENTO SSE
                .onErrorResume(ex -> Flux.just(
                        ServerSentEvent.<String>builder()
                                .event("error")
                                .data("stream_failed: " + ex.getMessage())
                                .build()))
                .concatWithValues(
                        ServerSentEvent.<String>builder().event("end").data("[DONE]").build());
    }
}
