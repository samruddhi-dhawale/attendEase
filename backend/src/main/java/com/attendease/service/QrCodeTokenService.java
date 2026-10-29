package com.attendease.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

/**
 * Service managing dynamic time-stepped rotating QR codes (10-second expiry).
 * Implements HMAC-SHA256 signature verification to prevent spoofing and screenshot forwarding.
 */
@Service
public class QrCodeTokenService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";

    @Value("${attendease.security.qr-rotation-seconds:10}")
    private int rotationIntervalSeconds;

    @Value("${attendease.security.qr-clock-skew-tolerance-seconds:3}")
    private int clockSkewToleranceSeconds;

    /**
     * Generates a signed token for the current 10-second window.
     * Format: sessionId:timeSlot:signature
     */
    public String generateTokenForSession(Long sessionId, String sessionSecretKey) {
        long timeSlot = getCurrentTimeSlot();
        String signature = sign(sessionId + ":" + timeSlot, sessionSecretKey);
        return sessionId + ":" + timeSlot + ":" + signature;
    }

    /**
     * Validates whether the provided token was generated for this session and is within
     * the active 10-second window (with 1 slot tolerance for transmission latency).
     */
    public boolean validateToken(Long sessionId, String token, String sessionSecretKey) {
        if (token == null || sessionSecretKey == null) {
            return false;
        }

        String[] parts = token.split(":");
        if (parts.length != 3) {
            return false;
        }

        try {
            Long tokenSessionId = Long.parseLong(parts[0]);
            long tokenSlot = Long.parseLong(parts[1]);
            String tokenSignature = parts[2];

            if (!tokenSessionId.equals(sessionId)) {
                return false;
            }

            long currentSlot = getCurrentTimeSlot();
            // Allow current slot and immediately previous slot (accounts for scan latency)
            boolean isSlotValid = (tokenSlot == currentSlot) || (tokenSlot == currentSlot - 1);
            if (!isSlotValid) {
                return false;
            }

            String expectedSig = sign(sessionId + ":" + tokenSlot, sessionSecretKey);
            return MessageDigest.isEqual(
                    expectedSig.getBytes(StandardCharsets.UTF_8),
                    tokenSignature.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Calculates remaining seconds in the current 10-second rotation window.
     */
    public long getRemainingSecondsInCurrentWindow() {
        long currentSec = System.currentTimeMillis() / 1000;
        return rotationIntervalSeconds - (currentSec % rotationIntervalSeconds);
    }

    public int getRotationIntervalSeconds() {
        return rotationIntervalSeconds;
    }

    /**
     * Generates a Base64-encoded Data URI PNG of the QR code using Google ZXing.
     */
    public String generateQrCodeDataUri(String content, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, width, height);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            byte[] pngData = outputStream.toByteArray();
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngData);
        } catch (Exception e) {
            throw new RuntimeException("Failed to render QR Code image: " + e.getMessage(), e);
        }
    }

    private long getCurrentTimeSlot() {
        return (System.currentTimeMillis() / 1000) / rotationIntervalSeconds;
    }

    private String sign(String data, String secret) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM);
            mac.init(secretKeySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException("Error computing HMAC signature", e);
        }
    }
}
