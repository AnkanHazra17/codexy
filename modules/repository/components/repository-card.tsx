"use client";

import { useState } from "react";
import type { Repository } from "@/types/repository.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLinkIcon,
  StarIcon,
  GitBranchIcon,
  CheckIcon,
  LinkIcon,
  UnlinkIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  connectRepository,
  disconnectRepository,
} from "../actions/repository.actions";
import { useQueryClient } from "@tanstack/react-query";
import { useConnectRepository } from "../hooks/use-connect-repository";

interface RepositoryCardProps {
  repository: Repository;
}

function RepositoryCard({ repository }: RepositoryCardProps) {
  const {
    id,
    name,
    full_name,
    description,
    html_url,
    stargazers_count,
    language,
    topics,
    isConnected,
  } = repository;

  const [isLoading, setIsLoading] = useState(false);
  const { mutate: connectRepository } = useConnectRepository();

  const handleConnect = () => {
    setIsLoading(true);
    if (isConnected) {
      return;
    } else {
      connectRepository(
        {
          owner: full_name.split("/")[0],
          repo: name,
          githubId: id,
        },
        { onSettled: () => setIsLoading(false) }
      );
    }
  };

  console.log(full_name);

  return (
    <div
      className={cn(
        "group relative rounded-lg border bg-card p-4 transition-all hover:shadow-md",
        isConnected && "border-primary/50 bg-primary/5"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <GitBranchIcon className="size-4 text-muted-foreground shrink-0" />
            <Link
              href={html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sm hover:text-primary transition-colors truncate"
            >
              {full_name}
            </Link>
            {isConnected && (
              <Badge variant="default" className="text-xs shrink-0">
                <CheckIcon className="size-3 mr-1" />
                Connected
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {description}
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon" className="shrink-0" asChild>
          <Link
            href={html_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${name} on GitHub`}
          >
            <ExternalLinkIcon className="size-4" />
          </Link>
        </Button>
      </div>

      {/* Footer - Stats and Tags */}
      <div className="flex items-center justify-between gap-4 mt-3 pt-3 border-t">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {language && (
            <div className="flex items-center gap-1">
              <div className="size-2 rounded-full bg-primary" />
              <span>{language}</span>
            </div>
          )}
          {stargazers_count > 0 && (
            <div className="flex items-center gap-1">
              <StarIcon className="size-3" />
              <span>{stargazers_count.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Topics */}
          {topics && topics.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {topics.slice(0, 3).map((topic) => (
                <Badge
                  key={topic}
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  {topic}
                </Badge>
              ))}
              {topics.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{topics.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Connect Button */}
          <Button
            variant={isConnected ? "outline" : "default"}
            size="sm"
            onClick={handleConnect}
            disabled={isLoading}
            className="shrink-0"
          >
            {isLoading ? (
              <>
                <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                {isConnected ? "Disconnecting..." : "Connecting..."}
              </>
            ) : isConnected ? (
              <>
                <UnlinkIcon className="size-3" />
                Disconnect
              </>
            ) : (
              <>
                <LinkIcon className="size-3" />
                Connect
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RepositoryCard;
