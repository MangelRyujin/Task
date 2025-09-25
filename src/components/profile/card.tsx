"use client";

import { Card, CardBody, Avatar, Button } from "@heroui/react";
import { FaDoorClosed } from "react-icons/fa";

interface ProfileCardProps {
  user: {
    name: string;
    email: string;
    picture: string;
  };
  onSignout: () => void;
}

export default function ProfileCard({ user, onSignout }: ProfileCardProps) {
  return (
    <Card className="bg-slate-900/40 border border-slate-600">
      <CardBody className="flex flex-col items-center gap-4">
        <Avatar src={user.picture} size="lg" />
        <div className="text-center">
          <h3 className="text-lg font-bold">{user.name}</h3>
          <p className="text-gray-500">{user.email}</p>
        </div>
        <Button color="danger" size="lg" variant="flat" onPress={onSignout} startContent={<FaDoorClosed size={20}/>}>
          Log out
        </Button>
      </CardBody>
    </Card>
  );
}
