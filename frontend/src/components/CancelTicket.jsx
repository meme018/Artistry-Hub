import React, { useState } from "react";
import { useUserStore } from "../store/user";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { Delete } from "@mui/icons-material";

const CancelTicketButton = ({ ticketId, eventTitle, onCancelSuccess }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUserStore();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCancelTicket = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/tickets/${ticketId}/cancel`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel ticket");
      }

      // Close the dialog
      handleClose();

      // Call the success callback (to refresh the tickets list)
      if (onCancelSuccess) {
        onCancelSuccess();
      }
    } catch (err) {
      console.error("Error cancelling ticket:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClickOpen}
        className="cancel-ticket-btn"
        aria-label="Cancel ticket"
      >
        <Delete /> Cancel Ticket
      </button>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="cancel-ticket-dialog-title"
      >
        <DialogTitle id="cancel-ticket-dialog-title">Cancel Ticket</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel your ticket for "{eventTitle}"? This
            action cannot be undone.
            {error && <span className="error-message">Error: {error}</span>}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" disabled={isLoading}>
            Keep Ticket
          </Button>
          <Button
            onClick={handleCancelTicket}
            color="error"
            disabled={isLoading}
            variant="contained"
          >
            {isLoading ? "Cancelling..." : "Yes, Cancel Ticket"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CancelTicketButton;
