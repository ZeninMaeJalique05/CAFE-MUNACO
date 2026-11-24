import { useEffect, useRef, useState } from "react";
import {
    Bell,
    BellOff,
    Volume2,
    VolumeX,
    CheckCheck,
    Ticket
} from "lucide-react";

const STORAGE_KEY = "kitchen_notifications";
const KNOWN_KEY = "kitchen_known_orders";

function NewOrderBell() {
    const [notifications, setNotifications] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch {
            return [];
        }
    });

    const [isOpen, setIsOpen] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(false);

    const audioContext = useRef(null);
    const wrapperRef = useRef(null);
    const knownOrderIds = useRef(new Set());
    const initialized = useRef(false);
    const soundEnabledRef = useRef(false);

    const unreadCount = notifications.filter(
        notification => !notification.read
    ).length;

    // Save notifications
    useEffect(() => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(notifications)
        );
    }, [notifications]);

    // Play notification sound
    const playBell = async () => {
        try {
            const ctx = audioContext.current;
            if (!ctx) return;

            if (ctx.state === "suspended") {
                await ctx.resume();
            }

            const now = ctx.currentTime;

            [880, 1174].forEach((frequency, index) => {
                const oscillator = ctx.createOscillator();
                const gain = ctx.createGain();

                oscillator.type = "sine";
                oscillator.frequency.value = frequency;

                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(
                    0.2, now + 0.02
                );
                gain.gain.exponentialRampToValueAtTime(
                    0.0001, now + 0.65
                );

                oscillator.connect(gain);
                gain.connect(ctx.destination);

                oscillator.start(now + index * 0.12);
                oscillator.stop(now + 0.8);
            });
        } catch (error) {
            console.error("Bell sound error:", error);
        }
    };

    // Toggle sound inside notification panel
    const toggleSound = async () => {
        if (soundEnabled) {
            soundEnabledRef.current = false;
            setSoundEnabled(false);
            return;
        }

        try {
            if (!audioContext.current) {
                const AudioContextClass =
                    window.AudioContext ||
                    window.webkitAudioContext;

                audioContext.current = new AudioContextClass();
            }

            await audioContext.current.resume();

            soundEnabledRef.current = true;
            setSoundEnabled(true);

            await playBell();
        } catch (error) {
            console.error("Unable to enable sound:", error);
        }
    };

    // Check incoming orders every 10 seconds
    useEffect(() => {
        let mounted = true;
        let checking = false;

        try {
            const savedIds = JSON.parse(
                localStorage.getItem(KNOWN_KEY) || "[]"
            );

            knownOrderIds.current = new Set(savedIds);
        } catch {
            knownOrderIds.current = new Set();
        }

        const checkOrders = async () => {
            if (checking) return;

            checking = true;

            try {
                const response = await fetch(
                    "http://localhost:5000/api/kitchen/orders/incoming"
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch orders");
                }

                const result = await response.json();

                if (!mounted || !result.success) return;

                const orders = result.data || [];

                // Detect new orders
                const newOrders = orders.filter(order => {
                    const orderId = String(order.id);

                    return !knownOrderIds.current.has(orderId);
                });

                if (newOrders.length > 0) {
                    const newNotifications = newOrders.map(order => ({
                        id: String(order.id),
                        orderNo: order.order_no,
                        customerName: order.customer_name,
                        createdAt: order.created_at,
                        read: false
                    }));

                    setNotifications(previous => {
                        const existingIds = new Set(
                            previous.map(item => item.id)
                        );

                        const uniqueNotifications =
                            newNotifications.filter(
                                item => !existingIds.has(item.id)
                            );

                        return [
                            ...uniqueNotifications,
                            ...previous
                        ].slice(0, 50);
                    });

                    // Play sound only after initial detection
                    if (
                        initialized.current &&
                        soundEnabledRef.current
                    ) {
                        playBell();
                    }
                }

                // Remember detected orders
                orders.forEach(order => {
                    knownOrderIds.current.add(String(order.id));
                });

                localStorage.setItem(
                    KNOWN_KEY,
                    JSON.stringify(
                        Array.from(knownOrderIds.current)
                    )
                );

                initialized.current = true;

            } catch (error) {
                console.error("Order checking error:", error);
            } finally {
                checking = false;
            }
        };

        checkOrders();

        const interval = setInterval(checkOrders, 10000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleOutsideClick = event => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);

    // Mark one notification as read
    const markAsRead = id => {
        setNotifications(previous =>
            previous.map(notification =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification
            )
        );
    };

    // Mark all notifications as read
    const markAllAsRead = () => {
        setNotifications(previous =>
            previous.map(notification => ({
                ...notification,
                read: true
            }))
        );
    };

    // Format notification date
    const formatDate = date => {
        if (!date) return "";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return "";

        return parsedDate.toLocaleString("en-PH", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    };

    return (
        <div className="notification-wrapper" ref={wrapperRef}>

            {/* Bell Button */}
            <button
                className="notification-button"
                onClick={() => setIsOpen(previous => !previous)}
                title="Notifications"
                aria-label="Toggle notifications"
                aria-expanded={isOpen}
            >
                <Bell size={19} />

                {unreadCount > 0 && (
                    <span className="notification-count">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
                <div className="notification-dropdown">

                    <div className="notification-header">
                        <div>
                            <h3>Notifications</h3>
                            <span>
                                {unreadCount} unread
                            </span>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                className="mark-all-read"
                                onClick={markAllAsRead}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="notification-list">

                        {notifications.length === 0 ? (
                            <div className="notification-empty">
                                <BellOff size={28} />
                                <p>No notifications yet</p>
                                <span>
                                    New orders will appear here.
                                </span>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <button
                                    key={notification.id}
                                    className={`notification-item ${
                                        notification.read
                                            ? "read"
                                            : "unread"
                                    }`}
                                    onClick={() =>
                                        markAsRead(notification.id)
                                    }
                                >
                                    <div className="notification-icon">
                                        <Ticket size={18} />
                                    </div>

                                    <div className="notification-details">
                                        <strong>
                                            New ticket {notification.orderNo}
                                        </strong>

                                        <p>
                                            {notification.customerName}'s
                                            order is waiting to be prepared.
                                        </p>

                                        <small>
                                            {formatDate(notification.createdAt)}
                                        </small>
                                    </div>

                                    {!notification.read && (
                                        <span className="unread-indicator" />
                                    )}
                                </button>
                            ))
                        )}

                    </div>

                    {/* Sound Settings */}
                    <div className="notification-footer">
                        <span>
                            {soundEnabled
                                ? "Sound enabled"
                                : "Sound disabled"}
                        </span>

                        <button
                            className="sound-toggle"
                            onClick={toggleSound}
                            title={
                                soundEnabled
                                    ? "Turn sound off"
                                    : "Turn sound on"
                            }
                        >
                            {soundEnabled
                                ? <Volume2 size={18} />
                                : <VolumeX size={18} />
                            }

                            {soundEnabled ? "Sound on" : "Sound off"}
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
}

export default NewOrderBell;
