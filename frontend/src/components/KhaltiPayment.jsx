import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUserStore } from "../store/user";
import "../styles/KhaltiPayment.css";

const KhaltiPayment = ({ event, onPaymentSuccess, onPaymentError }) => {
  const { token: authToken, currentUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);

  // API base URL
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Function to check if user has already paid
  const checkPaymentStatus = async () => {
    if (!authToken || !event?._id) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/payment/status/${event._id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      setPaymentStatus(response.data);

      if (response.data.hasPaid && response.data.ticketStatus === "approved") {
        // User already has a paid and approved ticket
        onPaymentSuccess && onPaymentSuccess();
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      setError("Failed to check payment status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPaymentStatus();
  }, [event?._id, authToken]);

  const handlePaymentClick = async () => {
    if (!event || !authToken) {
      onPaymentError && onPaymentError("Authentication required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Step 1: Call our backend to initiate payment
      const initiateResponse = await axios.post(
        `${API_BASE_URL}/payment/initiate`,
        { eventId: event._id },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Initiate payment response:", initiateResponse.data);

      // Step 2: Get event info from initiate response
      const { eventId, eventTitle, amountInPaisa } = initiateResponse.data.data;

      // Step 3: Initiate server-side payment through backend
      const paymentResponse = await axios.post(
        `${API_BASE_URL}/payment/create-payment-session`,
        {
          // Make sure to use the proper field names expected by the backend
          eventId,
          eventTitle,
          amount: amountInPaisa,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Payment session response:", paymentResponse.data);

      // Step 4: Redirect to Khalti payment page
      if (paymentResponse.data.success && paymentResponse.data.payment_url) {
        window.location.href = paymentResponse.data.payment_url;
      } else {
        throw new Error("Failed to create payment session");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);

      // Get detailed error message if available
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error?.error_key ||
        error.message ||
        "Failed to initiate payment";

      setError(errorMessage);
      onPaymentError && onPaymentError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // If already paid, show a different button
  if (paymentStatus?.hasPaid) {
    return (
      <button className="khalti-paid-btn" disabled>
        Payment Completed
      </button>
    );
  }

  // For free events, don't show Khalti button
  if (!event?.IsPaid || event?.Price <= 0) {
    return null;
  }

  return (
    <div className="khalti-payment-container">
      <button
        className="khalti-payment-btn"
        onClick={handlePaymentClick}
        disabled={loading}
      >
        {loading ? "Processing..." : `Pay with Khalti - NPR ${event?.Price}`}
      </button>

      {error && <div className="khalti-error-message">{error}</div>}
    </div>
  );
};

export default KhaltiPayment;
