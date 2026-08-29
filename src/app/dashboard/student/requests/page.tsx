"use client";
import RequestTabPage from "./RequestTabPage";

export default function ActiveRequestsPage() {
    return <RequestTabPage tab="active" emptyLabel="You have no open requests right now." />;
}
