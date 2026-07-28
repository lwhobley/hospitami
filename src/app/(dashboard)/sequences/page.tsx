"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Workflow,
  Mail,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useSequences, useCreateSequence } from "@/lib/hooks/use-sequences";
import { toast } from "sonner";

export default function SequencesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: sequences = [], isLoading } = useSequences();
  const createSequence = useCreateSequence();

  function handleCreate() {
    if (!name.trim()) return;
    createSequence.mutate(
      { name: name.trim(), description: description.trim() || undefined },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setName("");
          setDescription("");
          toast.success("Sequence created");
        },
        onError: () => toast.error("Failed to create sequence"),
      }
    );
  }

  return (
    <>
      <PageHeader
        title="Sequences"
        description="Multi-step outreach templates"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              AI Generate
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger render={<Button size="sm" />}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                New Sequence
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Sequence</DialogTitle>
                  <DialogDescription>
                    Build a multi-step outreach sequence.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="e.g., Fine Dining Outreach"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe the target audience and goals..."
                      className="resize-none"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={!name.trim() || createSequence.isPending}
                  >
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />
      <div className="flex-1 space-y-6 p-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : sequences.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Workflow className="mb-4 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">No sequences yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create your first outreach sequence
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sequences.map((seq) => (
              <Card key={seq.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm">{seq.name}</CardTitle>
                      {seq.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {seq.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {seq.steps.length > 0 ? (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {seq.steps.map((step, i) => (
                        <div key={step.id} className="flex items-center gap-2">
                          {step.type === "EMAIL" ? (
                            <div className="flex min-w-[200px] items-start gap-2 rounded-lg border p-3">
                              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <div className="min-w-0">
                                <p className="truncate text-xs font-medium">
                                  {step.subject ?? "Email"}
                                </p>
                                {step.body && (
                                  <p className="mt-0.5 line-clamp-2 text-[10px] text-muted-foreground">
                                    {step.body}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : step.type === "WAIT" ? (
                            <div className="flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-2">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Wait {step.waitDays}d
                              </span>
                            </div>
                          ) : null}
                          {i < seq.steps.length - 1 && (
                            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No steps yet</p>
                  )}
                  <div className="mt-3 flex items-center gap-4 border-t pt-3 text-xs text-muted-foreground">
                    <span>{seq._count?.campaigns ?? 0} campaigns</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
