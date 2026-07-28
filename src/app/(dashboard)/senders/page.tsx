"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Plus, Users, Shield, CheckCircle2, AlertCircle, Globe } from "lucide-react";
import { useState } from "react";
import {
  useSenders,
  useAddSenderAccount,
  useAddSenderDomain,
  useUpdateSender,
  useDeleteSender,
} from "@/lib/hooks/use-senders";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  warming: {
    label: "Warming",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  paused: { label: "Paused", className: "bg-muted text-muted-foreground" },
  disabled: {
    label: "Disabled",
    className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  },
};

export default function SendersPage() {
  const [tab, setTab] = useState("accounts");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addName, setAddName] = useState("");
  const [addDomain, setAddDomain] = useState("");
  const [addType, setAddType] = useState<"account" | "domain">("account");

  const { data, isLoading } = useSenders();
  const addAccount = useAddSenderAccount();
  const addDomainMutation = useAddSenderDomain();
  const updateSender = useUpdateSender();
  const deleteSender = useDeleteSender();

  const accounts = data?.accounts ?? [];
  const domains = data?.domains ?? [];

  function handleAdd() {
    if (addType === "account") {
      if (!addEmail.trim()) return;
      addAccount.mutate(
        { email: addEmail.trim(), name: addName.trim() || undefined },
        {
          onSuccess: () => {
            setAddDialogOpen(false);
            setAddEmail("");
            setAddName("");
            toast.success("Sender account added");
          },
          onError: () => toast.error("Failed to add sender"),
        }
      );
    } else {
      if (!addDomain.trim()) return;
      addDomainMutation.mutate(addDomain.trim(), {
        onSuccess: () => {
          setAddDialogOpen(false);
          setAddDomain("");
          toast.success("Domain added — check DNS records");
        },
        onError: () => toast.error("Failed to add domain"),
      });
    }
  }

  const isPending = addAccount.isPending || addDomainMutation.isPending;

  return (
    <>
      <PageHeader
        title="Senders"
        description="Manage sender accounts and domains"
        actions={
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger render={<Button size="sm" />}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Sender
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Sender</DialogTitle>
                <DialogDescription>
                  Add a sender account or verify a domain.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex gap-2">
                  <Button
                    variant={addType === "account" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAddType("account")}
                  >
                    Account
                  </Button>
                  <Button
                    variant={addType === "domain" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAddType("domain")}
                  >
                    Domain
                  </Button>
                </div>
                {addType === "account" ? (
                  <>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        placeholder="sender@yourdomain.com"
                        value={addEmail}
                        onChange={(e) => setAddEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Name (optional)</Label>
                      <Input
                        placeholder="Jane Smith"
                        value={addName}
                        onChange={(e) => setAddName(e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label>Domain</Label>
                    <Input
                      placeholder="yourdomain.com"
                      value={addDomain}
                      onChange={(e) => setAddDomain(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={isPending}>
                  {isPending ? "Adding..." : "Add"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Active Senders
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {accounts.filter((s) => s.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">of {accounts.length} total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Sent Today
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {accounts.reduce((a, s) => a + s.sentToday, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                of {accounts.reduce((a, s) => a + s.dailyLimit, 0)} daily limit
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Domains
              </CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{domains.length}</div>
              <p className="text-xs text-muted-foreground">
                {domains.filter((d) => d.verified).length} verified
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Health
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">Good</div>
              <p className="text-xs text-muted-foreground">All systems healthy</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsList>
              <TabsTrigger value="accounts">Sender Accounts</TabsTrigger>
              <TabsTrigger value="domains">Domains</TabsTrigger>
            </TabsList>
          </TabsList>
        </Tabs>

        {tab === "accounts" && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sender</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Warmup Day</TableHead>
                  <TableHead>Daily Usage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <div className="h-8 animate-pulse rounded bg-muted" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : accounts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      No sender accounts yet
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts.map((sender) => (
                    <TableRow key={sender.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{sender.name}</p>
                          <p className="text-xs text-muted-foreground">{sender.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig[sender.status]?.className}`}
                        >
                          {statusConfig[sender.status]?.label ?? sender.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {sender.warmupDay != null ? `Day ${sender.warmupDay}` : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <span className="text-xs">
                            {sender.sentToday}/{sender.dailyLimit}
                          </span>
                          <div className="h-1.5 w-24 rounded-full bg-muted">
                            <div
                              className="h-1.5 rounded-full bg-primary"
                              style={{
                                width: `${(sender.sentToday / sender.dailyLimit) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            deleteSender.mutate(sender.id, {
                              onError: () => toast.error("Failed to delete sender"),
                            })
                          }
                          disabled={deleteSender.isPending}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {tab === "domains" && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>DKIM</TableHead>
                  <TableHead>SPF</TableHead>
                  <TableHead>DMARC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <div className="h-8 animate-pulse rounded bg-muted" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : domains.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      No domains added yet
                    </TableCell>
                  </TableRow>
                ) : (
                  domains.map((domain) => (
                    <TableRow key={domain.id}>
                      <TableCell className="text-sm font-medium">{domain.domain}</TableCell>
                      <TableCell>
                        {domain.verified ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-200 text-[10px] text-emerald-600"
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-amber-200 text-[10px] text-amber-600"
                          >
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {domain.dkimRecord ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        {domain.spfRecord ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        {domain.dmarcRecord ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
