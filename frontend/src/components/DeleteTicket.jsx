import React, { useState } from "react";
import { Delete } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useUserStore } from "../store/user";

const DeletePastTicketButton = ({ ticketId, eventTitle, onDeleteSuccess }) => {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUserStore();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  const handleDelete = async () => {
    if (!token) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/tickets/${ticketId}/delete-past`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete ticket");
      }

      // Close the dialog and call the success callback
      handleClose();
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (err) {
      console.error("Error deleting past ticket:", err);
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="error"
        startIcon={<Delete />}
        onClick={handleClickOpen}
        size="small"
        className="delete-past-ticket-btn"
      >
        Remove from history
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Remove Past Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove "{eventTitle}" from your ticket
            history? This action cannot be undone.
          </DialogContentText>
          {error && (
            <DialogContentText color="error" sx={{ mt: 2 }}>
              Error: {error}
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            disabled={isDeleting}
            autoFocus
          >
            {isDeleting ? "Removing..." : "Remove"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeletePastTicketButton;
