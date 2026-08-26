package com.bezkoder.springjwt.payload.response;

import java.util.Date;

/**
 * Standardized generic API response wrapper for Spring Boot REST endpoints.
 */
public class ApiResponse<T> {

    private String status;
    private String message;
    private T data;
    private long timestamp;

    public ApiResponse() {
        this.timestamp = System.currentTimeMillis();
    }

    public ApiResponse(String status, String message) {
        this.status = status;
        this.message = message;
        this.timestamp = System.currentTimeMillis();
    }

    public ApiResponse(String status, String message, T data) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.timestamp = System.currentTimeMillis();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>("SUCCESS", message, data);
    }

    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>("SUCCESS", message, null);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>("ERROR", message, null);
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
