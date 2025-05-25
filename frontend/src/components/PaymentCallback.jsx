import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Error, HourglassEmpty } from "@mui/icons-material";
import "../styles/PaymentCallback.css";
import { useUserStore } from "../store/user";

const PaymentCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Processing your payment...");
  const [countdown, setCountdown] = useState(5);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [debug, setDebug] = useState(null); // For debugging information
  const { token } = useUserStore();

  useEffect(() => {
    // Extract all URL parameters for debugging
    const params = new URLSearchParams(location.search);
    const paramsObj = {};
    for (const [key, value] of params.entries()) {
      paramsObj[key] = value;
    }
    setDebug(paramsObj);

    // Get important parameters
    const paymentStatus = params.get("status");
    const paymentMessage = params.get("message");
    const pidx = params.get("pidx");
    const txnId = params.get("transaction_id");

    // Try multiple possible sources for eventId
    let eventId = params.get("eventId");

    console.log("Payment callback parameters:", {
      status: paymentStatus,
      message: paymentMessage,
      pidx,
      txnId,
      eventId,
      allParams: paramsObj,
    });

    const createTicketAfterPayment = async () => {
      // Only try to create ticket if payment was successful and we have auth token
      if (
        (paymentStatus === "Completed" || paymentStatus === "success") &&
        token
      ) {
        try {
          setIsCreatingTicket(true);

          // Try to extract eventId from purchase_order_id if available
          if (!eventId && params.get("purchase_order_id")) {
            const orderIdParts = params.get("purchase_order_id").split("_");
            if (orderIdParts.length >= 2) {
              eventId = orderIdParts[1]; // Based on your format: order_eventId_userId_timestamp
              console.log("Extracted eventId from purchase_order_id:", eventId);
            }
          }

          if (!eventId) {
            throw new Error("Event ID not found in callback parameters");
          }

          // Call your backend API to create a ticket after successful payment
          const response = await fetch(
            "http://localhost:5000/api/tickets/create-after-payment",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                eventId: eventId,
                paymentId: txnId || "",
                pidx: pidx || "",
              }),
            }
          );

          const data = await response.json();
          console.log("Ticket creation response:", data);

          if (!response.ok) {
            // FIX: Handle errors from the API properly
            if (data.message && data.message.includes("duplicate key error")) {
              // Handle duplicate ticket gracefully
              console.log(
                "Duplicate ticket detected - user already has a ticket for this event"
              );
              setStatus("success");
              setMessage(
                "Payment successful! You already have a ticket for this event."
              );
              startCountdownAndRedirect();
              return;
            } else {
              // Handle other API errors
              throw new Error(
                data.message || "Failed to create ticket after payment"
              );
            }
          }

          // Continue with success flow
          setStatus("success");
          setMessage(
            data.message ||
              "Payment successful! Your ticket has been confirmed."
          );

          // Start countdown
          startCountdownAndRedirect();
        } catch (error) {
          // FIX: Proper error handling
          console.error("Error creating ticket after payment:", error);
          setStatus("error");
          setMessage(
            `Payment was processed but we couldn't create your ticket: ${
              error.message || "Unknown error"
            }. Please contact support.`
          );
        } finally {
          setIsCreatingTicket(false);
        }
      } else if (paymentStatus === "Completed" || paymentStatus === "success") {
        // Payment success but missing token or eventId
        console.warn("Payment successful but missing token or eventId", {
          token,
          eventId,
        });
        setStatus("success");
        setMessage(
          paymentMessage ||
            "Payment successful! Please check your tickets page or try refreshing."
        );
        startCountdownAndRedirect();
      } else {
        // Handle different payment statuses
        if (paymentStatus === "Pending") {
          setStatus("pending");
          setMessage(
            paymentMessage ||
              "Your payment is being processed. We will update you once confirmed."
          );
        } else if (paymentStatus === "Cancelled") {
          setStatus("cancelled");
          setMessage(
            paymentMessage ||
              "Payment was cancelled. Please try again if you wish to purchase a ticket."
          );
        } else {
          setStatus("error");
          setMessage(
            paymentMessage ||
              "There was a problem with your payment. Please try again."
          );
        }
      }
    };

    const startCountdownAndRedirect = () => {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            navigate("/Ticket");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    };

    if (paymentStatus) {
      createTicketAfterPayment();
    } else {
      // No status provided
      setStatus("error");
      setMessage("No payment information received. Please try again.");
    }
  }, [location, navigate, token]);

  // Handle view tickets button
  const handleViewTickets = () => {
    navigate("/Ticket");
  };

  // Handle return to events button
  const handleReturnToEvents = () => {
    navigate("/events");
  };

  // Handle try again button
  const handleTryAgain = () => {
    // Go back to previous page
    navigate(-1);
  };

  return (
    <div className="payment-callback-container">
      <div className="payment-card">
        <div className="payment-status-icon">
          {status === "success" && <CheckCircle className="success-icon" />}
          {status === "pending" && <HourglassEmpty className="pending-icon" />}
          {(status === "error" || status === "cancelled") && (
            <Error className="error-icon" />
          )}
        </div>

        <h2 className="payment-title">
          {status === "success" && "Payment Successful"}
          {status === "pending" && "Payment Pending"}
          {status === "cancelled" && "Payment Cancelled"}
          {status === "error" && "Payment Failed"}
          {status === "processing" && "Processing"}
        </h2>

        <p className="payment-message">{message}</p>

        {isCreatingTicket && (
          <p className="creating-ticket-message">
            Creating your ticket, please wait...
          </p>
        )}

        {status === "success" && !isCreatingTicket && (
          <p className="redirect-message">
            Redirecting to tickets in {countdown} seconds...
          </p>
        )}

        <div className="payment-actions">
          {status === "success" && (
            <button className="btn-primary" onClick={handleViewTickets}>
              View My Tickets
            </button>
          )}

          {(status === "error" || status === "cancelled") && (
            <>
              <button className="btn-primary" onClick={handleTryAgain}>
                Try Again
              </button>
              <button className="btn-secondary" onClick={handleReturnToEvents}>
                Browse Events
              </button>
            </>
          )}

          {status === "pending" && (
            <button className="btn-primary" onClick={handleViewTickets}>
              Check Ticket Status
            </button>
          )}
        </div>

        {/* Debug information (only visible in development) */}
        {process.env.NODE_ENV === "development" && debug && (
          <div className="debug-container">
            <details>
              <summary>Debug Info</summary>
              <pre className="debug-info">{JSON.stringify(debug, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;
