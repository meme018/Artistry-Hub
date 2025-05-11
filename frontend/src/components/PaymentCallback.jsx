import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Error, HourglassEmpty } from "@mui/icons-material";
import "../styles/PaymentCallback.css";

const PaymentCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Processing your payment...");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Get status from URL query parameters
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get("status");
    const paymentMessage = params.get("message");
    const pidx = params.get("pidx");
    const txnId = params.get("transaction_id");

    console.log("Payment callback parameters:", {
      status: paymentStatus,
      message: paymentMessage,
      pidx,
      txnId,
    });

    if (paymentStatus) {
      // Handle different payment statuses
      if (paymentStatus === "Completed" || paymentStatus === "success") {
        setStatus("success");
        setMessage(
          paymentMessage ||
            "Payment successful! Your ticket has been confirmed."
        );
      } else if (paymentStatus === "Pending") {
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
    } else {
      // No status provided
      setStatus("error");
      setMessage("No payment information received. Please try again.");
    }

    // If successful, start countdown and redirect to tickets page
    if (paymentStatus === "Completed" || paymentStatus === "success") {
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
    }
  }, [location, navigate]);

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
      <div className="payment-callback-card">
        <div className="payment-status-icon">
          {status === "success" && <CheckCircle className="icon success" />}
          {status === "pending" && <HourglassEmpty className="icon pending" />}
          {(status === "error" || status === "cancelled") && (
            <Error className="icon error" />
          )}
        </div>

        <h2 className={`payment-status ${status}`}>
          {status === "success" && "Payment Successful"}
          {status === "pending" && "Payment Pending"}
          {status === "cancelled" && "Payment Cancelled"}
          {status === "error" && "Payment Failed"}
        </h2>

        <p className="payment-message">{message}</p>

        {status === "success" && (
          <p className="redirect-message">
            Redirecting to tickets in {countdown} seconds...
          </p>
        )}

        <div className="payment-actions">
          {status === "success" && (
            <button className="primary-btn" onClick={handleViewTickets}>
              View My Tickets
            </button>
          )}

          {(status === "error" || status === "cancelled") && (
            <>
              <button className="secondary-btn" onClick={handleTryAgain}>
                Try Again
              </button>
              <button className="primary-btn" onClick={handleReturnToEvents}>
                Browse Events
              </button>
            </>
          )}

          {status === "pending" && (
            <button className="primary-btn" onClick={handleViewTickets}>
              Check Ticket Status
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;
