"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, ListChecks, Search, Users } from "lucide-react";
import { useLists, useCreateList } from "@/lib/hooks/use-lists";
import { toast } from "sonner";

export default function ListsPage() {
  const [search, setSearch] = useState("");
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: lists = [], isLoading } = useLists();
  const createList = useCreateList();

  const filtered = lists.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.description?.toLowerCase().includes(search.toLowerCase())
  );

  function handleCreate() {
    if (!newListName.trim()) return;
    createList.mutate(
      { name: newListName.trim(), description: newListDesc.trim() || undefined },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setNewListName("");
          setNewListDesc("");
          toast.success("List created");
        },
        onError: () => toast.error("Failed to create list"),
      }
    );
  }

  return (
    <>
      <PageHeader
        title="Lead Lists"
        description="Organize and manage your leads"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button size="sm" />}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New List
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New List</DialogTitle>
                <DialogDescription>
                  Create a list to organize your leads.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Houston Fine Dining"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Optional description"
                    value={newListDesc}
                    onChange={(e) => setNewListDesc(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!newListName.trim() || createList.isPending}
                >
                  Create List
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lists..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {filtered.length} list{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ListChecks className="mb-4 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">No lists found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {search
                  ? "Try a different search term"
                  : "Create your first lead list to get started"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((list) => (
              <Link key={list.id} href={`/lists/${list.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardHeader className="flex flex-row items-start justify-between pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      <CardTitle className="text-sm">{list.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {list.description && (
                      <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
                        {list.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {list._count?.members ?? 0} leads
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(list.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
