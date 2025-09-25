"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

interface ConfirmCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
  isCompleted: boolean;
}

export default function ConfirmCompleteModal({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
  isCompleted,
}: ConfirmCompleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop="blur">
      <ModalContent>
        <ModalHeader className="font-bold">
          {isCompleted ? "Mark as pending" : "Complete task"}
        </ModalHeader>
        <ModalBody>
          Do you want to {isCompleted ? "restore" : "complete"} the task{" "}
          <span className="font-semibold">“{taskTitle}”</span>?
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button
            variant="shadow"
            color={isCompleted ? "primary" : "success"}
            onPress={onConfirm}
          >
            {isCompleted ? "Mark pending" : "Complete"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
