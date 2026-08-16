"use client";
import { Box } from "@mui/material";
import BatchCard from "@/components/batches/BatchCard";
import { useRouter } from "next/navigation";
const T_ASHISH = [{ name: "Ashish Saini", avatar: "https://cdn-icons-png.flaticon.com/512/1754/1754623.png" }];
const T_KUSHAL = [{ name: "Kushal Korde", avatar: "https://cdn-icons-png.flaticon.com/512/1754/1754623.png" }];
const T_OMKAR = [{ name: "Omkar", avatar: "https://cdn-icons-png.flaticon.com/512/1754/1754623.png" }];
const T_SHIV = [{ name: "Shivkumar Chauhan", avatar: "https://cdn-icons-png.flaticon.com/512/1754/1754623.png" }];

const BATCHES = [
    {
        id: 1,
        title: "Cisco Certified Network Associate",
        batchProgress: 45,
        attendance: 78,
        mode: "Offline" as const,
        todayTopic: "Subnetting & VLSM",
        todayTime: "Tomorrow • 11:00 AM",
        hasJoinClass: false,
        trainers: T_KUSHAL,
    },
    {
        id: 2,
        title: "Soft Skills & Communication",
        batchProgress: 82,
        attendance: 95,
        mode: "Hybrid" as const,
        todayTopic: "Resume & LinkedIn Masterclass",
        todayTime: "3rd Aug • 3:00 PM",
        hasJoinClass: false,
        trainers: T_ASHISH,
    },
    {
        id: 3,
        title: "Ethical Hacking & Penetration Testing",
        batchProgress: 31,
        attendance: 88,
        mode: "Online" as const,
        todayTopic: "Web Application Attacks (OWASP Top 10)",
        todayTime: "Today • 11:00 AM",
        hasJoinClass: true,
        trainers: T_OMKAR,
    },
    {
        id: 4,
        title: "SOC Analyst (Level 1)",
        batchProgress: 58,
        attendance: 83,
        mode: "Online" as const,
        todayTopic: "SIEM Fundamentals & Log Analysis",
        todayTime: "Today • 2:00 PM",
        hasJoinClass: true,
        trainers: T_SHIV,
    },
    {
        id: 5,
        title: "AWS Cloud Practitioner",
        batchProgress: 14,
        attendance: 91,
        mode: "Online" as const,
        todayTopic: "IAM Roles, Policies & MFA",
        todayTime: "2nd Aug • 10:00 AM",
        hasJoinClass: false,
        trainers: T_ASHISH,
    },
    {
        id: 6,
        title: "Cisco Certified Network Professional",
        batchProgress: 72,
        attendance: 80,
        mode: "Offline" as const,
        todayTopic: "BGP Route Policies & Path Selection",
        todayTime: "Today • 4:00 PM",
        hasJoinClass: true,
        trainers: T_KUSHAL,
    },
    {
        id: 7,
        title: "Python for Cybersecurity",
        batchProgress: 38,
        attendance: 86,
        mode: "Online" as const,
        todayTopic: "Building a Port Scanner with Sockets",
        todayTime: "Tomorrow • 12:00 PM",
        hasJoinClass: false,
        trainers: T_OMKAR,
    },
    {
        id: 8,
        title: "Digital Forensics & Incident Response",
        batchProgress: 22,
        attendance: 74,
        mode: "Hybrid" as const,
        todayTopic: "Memory Forensics with Volatility",
        todayTime: "31st Jul • 10:00 AM",
        hasJoinClass: false,
        trainers: T_SHIV,
    },
    {
        id: 9,
        title: "Linux for Security Professionals",
        batchProgress: 61,
        attendance: 89,
        mode: "Online" as const,
        todayTopic: "Bash Scripting & Cron Job Automation",
        todayTime: "Today • 5:00 PM",
        hasJoinClass: true,
        trainers: T_KUSHAL,
    },
    {
        id: 10,
        title: "Microsoft Azure Security (AZ-500)",
        batchProgress: 9,
        attendance: 96,
        mode: "Online" as const,
        todayTopic: "Azure Active Directory & Conditional Access",
        todayTime: "4th Aug • 11:00 AM",
        hasJoinClass: false,
        trainers: T_ASHISH,
    },
];

export default function OngoingBatchesPage() {
    const router = useRouter();
    return (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 2 }}>
            {BATCHES.map((batch) => (
                <BatchCard
                    key={batch.id}
                    variant="ongoing"
                    trainers={batch.trainers}
                    {...batch}
                    onViewDetails={() => {
                        router.push(`/dashboard/student/batch/${batch.id}`);
                    }}
                />
            ))}
        </Box>
    );
}