import React, {useRef} from "react";
import {Signal, useSignalEffect} from "@preact/signals-react";
import {toast} from "react-toastify";
import {IControlNotify, IRoomMember} from "@/types/room";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import noneAvatar from "@assets/img/none-avatar.jpg";
import {Button} from "@/components/ui/button";
export const AskControlNotifyItem = ({
  closeAccept,
  closeRefuse,
  member,
}: {
  closeAccept: () => void;
  closeRefuse: () => void;
  member: IRoomMember;
}) => {
  return (
    <>
      <div className="flex justify-center items-center">
        <Avatar className={`h-[26px] w-[26px] mx-2`} title={member.username}>
          {member.avatar ? (
            <AvatarImage src={member.avatar} alt="Avatar" />
          ) : (
            <AvatarImage src={noneAvatar} alt="@room" />
          )}
          <AvatarFallback></AvatarFallback>
        </Avatar>
        <p className="text-sm my-auto mx-1">
          {member.username} want to control?
        </p>
      </div>
      <div className="flex justify-center items-center mt-2">
        <Button
          className="text-sm h-8 my-auto  mx-1 py-0"
          variant={"outline"}
          onClick={closeAccept}
        >
          Accept
        </Button>
        <Button
          className="text-sm h-8 my-auto  mx-1  py-0"
          variant={"outline"}
          onClick={closeRefuse}
        >
          Refuse
        </Button>
      </div>
    </>
  );
};
export const AskControlNotify = ({
  status,
  member,
}: {
  member: Signal<IRoomMember | null>;
  status: Signal<IControlNotify>;
}) => {
  const toastId = useRef<any | null>(null);
  const closeAccept = () => {
    status.value = "accept";
    setTimeout(() => {
      status.value = "none";
      member.value = null;
    }, 1000);
  };
  const closeRefuse = () => {
    status.value = "refuse";
    setTimeout(() => {
      status.value = "none";
      member.value = null;
    }, 1000);
  };
  useSignalEffect(() => {
    if (status.value === "none" || !member.value) {
      toastId.current = null;
      return;
    } else {
      if (toastId.current === null) {
        toastId.current = toast(
          <AskControlNotifyItem
            closeRefuse={closeRefuse}
            closeAccept={closeAccept}
            member={member.value}
          />,
          {
            position: "bottom-right",
            autoClose: false,
            closeButton: <></>,
          }
        );
      } else {
        toast.update(toastId.current);
      }
    }
  });
  return <></>;
};
