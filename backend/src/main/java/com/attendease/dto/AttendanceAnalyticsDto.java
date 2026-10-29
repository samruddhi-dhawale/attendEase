package com.attendease.dto;

import java.util.Map;

public class AttendanceAnalyticsDto {
    private long totalSessions;
    private long totalStudents;
    private long totalRecords;
    private long totalPresent;
    private long totalLate;
    private long totalProxyBlocked;
    private double overallAttendanceRate;
    private double punctualityRate;
    private Map<String, Long> statusBreakdown;
    private Map<String, Long> weeklyTrends;

    public AttendanceAnalyticsDto() {}

    public long getTotalSessions() { return totalSessions; }
    public void setTotalSessions(long totalSessions) { this.totalSessions = totalSessions; }

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getTotalRecords() { return totalRecords; }
    public void setTotalRecords(long totalRecords) { this.totalRecords = totalRecords; }

    public long getTotalPresent() { return totalPresent; }
    public void setTotalPresent(long totalPresent) { this.totalPresent = totalPresent; }

    public long getTotalLate() { return totalLate; }
    public void setTotalLate(long totalLate) { this.totalLate = totalLate; }

    public long getTotalProxyBlocked() { return totalProxyBlocked; }
    public void setTotalProxyBlocked(long totalProxyBlocked) { this.totalProxyBlocked = totalProxyBlocked; }

    public double getOverallAttendanceRate() { return overallAttendanceRate; }
    public void setOverallAttendanceRate(double overallAttendanceRate) { this.overallAttendanceRate = overallAttendanceRate; }

    public double getPunctualityRate() { return punctualityRate; }
    public void setPunctualityRate(double punctualityRate) { this.punctualityRate = punctualityRate; }

    public Map<String, Long> getStatusBreakdown() { return statusBreakdown; }
    public void setStatusBreakdown(Map<String, Long> statusBreakdown) { this.statusBreakdown = statusBreakdown; }

    public Map<String, Long> getWeeklyTrends() { return weeklyTrends; }
    public void setWeeklyTrends(Map<String, Long> weeklyTrends) { this.weeklyTrends = weeklyTrends; }
}
