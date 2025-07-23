import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Profile } from "@/db/schemas/profiles";
import { formatDate } from "@/lib/utils";
import {
  AlertCircle,
  BadgeCheck,
  Banknote,
  Calendar,
  CreditCard,
  Mail,
  Tag,
  User,
  Wallet,
  X,
} from "lucide-react";

interface ProfileDisplayProps {
  profile: Profile;
}

export function ProfileDisplay({ profile }: ProfileDisplayProps) {
  return (
    <div className="bg-card text-card-foreground animate-in fade-in-50 rounded-lg border shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Profile Dashboard</h2>
          <Badge variant={profile.hasSub ? "default" : "outline"} className="text-sm">
            {profile.hasSub ? (
              <BadgeCheck className="mr-1 h-4 w-4" />
            ) : (
              <X className="mr-1 h-4 w-4" />
            )}
            {profile.hasSub ? "Subscribed" : "Not Subscribed"}
          </Badge>
        </div>

        <Separator className="my-4" />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-primary text-xl font-medium">Personal Information</h3>

            <div className="flex items-center space-x-2">
              <User className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm leading-none font-medium">Name</p>
                <p className="text-muted-foreground text-sm">{profile.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Mail className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm leading-none font-medium">Email</p>
                <p className="text-muted-foreground text-sm">{profile.mail}</p>
              </div>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="space-y-4">
            <h3 className="text-primary text-xl font-medium">Subscription Status</h3>

            <div className="flex items-center space-x-2">
              <Calendar className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm leading-none font-medium">Initial Subscription</p>
                <p className="text-muted-foreground text-sm">
                  {profile.initialSubDate
                    ? formatDate(profile.initialSubDate)
                    : "Not subscribed yet"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <AlertCircle className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm leading-none font-medium">Cancel Next Month</p>
                <p className="text-muted-foreground text-sm">
                  {profile.cancelNextMonth ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Credits */}
          <div className="space-y-4">
            <h3 className="text-primary text-xl font-medium">Credit Balance</h3>

            <div className="bg-accent/30 flex items-center space-x-3 rounded-md p-3">
              <Wallet className="text-primary h-8 w-8" />
              <div>
                <p className="text-sm leading-none font-medium">Subscription Credits</p>
                <p className="text-2xl font-bold">{profile.subCredits}</p>
              </div>
            </div>

            <div className="bg-accent/30 flex items-center space-x-3 rounded-md p-3">
              <CreditCard className="text-primary h-8 w-8" />
              <div>
                <p className="text-sm leading-none font-medium">OTP Credits</p>
                <p className="text-2xl font-bold">{profile.otpCredits}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm leading-none font-medium">Last OTP Date</p>
                <p className="text-muted-foreground text-sm">
                  {profile.lastOtpDate ? formatDate(profile.lastOtpDate) : "No OTP used"}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <h3 className="text-primary text-xl font-medium">Payment Information</h3>

            <div className="flex items-center space-x-2">
              <Banknote className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm leading-none font-medium">Customer ID</p>
                <p className="text-muted-foreground max-w-xs truncate text-sm">
                  {profile.customerId}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Tag className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm leading-none font-medium">Price ID</p>
                <p className="text-muted-foreground max-w-xs truncate text-sm">{profile.priceId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
