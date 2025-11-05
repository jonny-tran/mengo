"use client";

import * as React from "react";
import { MessageCircle, Mic, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Settings, Eye, Trash2 } from "lucide-react";

type Channel = {
  title: string;
  url: string;
};

export function NavCommunication({
  label = "Communication",
  textChannels,
  voiceChannels,
}: {
  label?: string;
  textChannels: Channel[];
  voiceChannels: Channel[];
}) {
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createType, setCreateType] = React.useState<"chat" | "voice">("chat");
  const [createName, setCreateName] = React.useState("");
  const { isMobile } = useSidebar();

  function openCreate(defaultType: "chat" | "voice") {
    setCreateType(defaultType);
    setCreateOpen(true);
  }

  function handleCreate() {
    // Mock: thay bằng logic gọi API/route khi sẵn sàng
    console.log("Create channel:", { type: createType, name: createName });
    setCreateOpen(false);
    setCreateName("");
  }
  return (
    <SidebarGroup>
      <div className="flex items-center justify-between pr-2">
        <SidebarGroupLabel>{label}</SidebarGroupLabel>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          aria-label="Create channel"
          title="Create channel"
          onClick={() => openCreate("chat")}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <SidebarMenu>
        {/* Text channels */}
        <Collapsible asChild defaultOpen>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Text Channels">
              <MessageCircle />
              <span>Text Channels</span>
            </SidebarMenuButton>

            {/* Plus removed from item header; use global plus near label */}

            <CollapsibleTrigger asChild>
              <SidebarMenuAction className="data-[state=open]:rotate-90">
                <ChevronRight />
                <span className="sr-only">Toggle</span>
              </SidebarMenuAction>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <SidebarMenuSub>
                {textChannels.map((c) => (
                  <SidebarMenuSubItem key={c.title}>
                    <SidebarMenuSubButton asChild>
                      <Link href={c.url}>
                        <span>{c.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction showOnHover>
                          <MoreHorizontal />
                          <span className="sr-only">More</span>
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-44"
                        side={isMobile ? "bottom" : "right"}
                        align={isMobile ? "end" : "start"}
                      >
                        <DropdownMenuItem>
                          <Eye className="text-muted-foreground" />
                          <span>View</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="text-muted-foreground" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Trash2 className="text-muted-foreground" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>

        {/* Voice channels */}
        <Collapsible asChild defaultOpen>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Voice Channels">
              <Mic />
              <span>Voice Channels</span>
            </SidebarMenuButton>

            {/* Plus removed from item header; use global plus near label */}

            <CollapsibleTrigger asChild>
              <SidebarMenuAction className="data-[state=open]:rotate-90">
                <ChevronRight />
                <span className="sr-only">Toggle</span>
              </SidebarMenuAction>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <SidebarMenuSub>
                {voiceChannels.map((c) => (
                  <SidebarMenuSubItem key={c.title}>
                    <SidebarMenuSubButton asChild>
                      <Link href={c.url}>
                        <span>{c.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction showOnHover>
                          <MoreHorizontal />
                          <span className="sr-only">More</span>
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-44"
                        side={isMobile ? "bottom" : "right"}
                        align={isMobile ? "end" : "start"}
                      >
                        <DropdownMenuItem>
                          <Eye className="text-muted-foreground" />
                          <span>View</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="text-muted-foreground" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Trash2 className="text-muted-foreground" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
      {/* Create Channel Dialog (Discord-like) */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Create Channel</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="text-sm font-medium">Channel Type</div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCreateType("chat")}
                className={`border rounded-md px-3 py-3 flex items-center gap-2 text-left ${
                  createType === "chat" ? "border-primary" : "border-muted"
                }`}
              >
                <MessageCircle className="shrink-0" />
                <span>Text</span>
              </button>
              <button
                type="button"
                onClick={() => setCreateType("voice")}
                className={`border rounded-md px-3 py-3 flex items-center gap-2 text-left ${
                  createType === "voice" ? "border-primary" : "border-muted"
                }`}
              >
                <Mic className="shrink-0" />
                <span>Voice</span>
              </button>
            </div>
            <div className="grid gap-2">
              <div className="text-sm font-medium">Channel Name</div>
              <Input
                placeholder={
                  createType === "voice" ? "e.g. Lounge" : "e.g. general"
                }
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Channel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarGroup>
  );
}
