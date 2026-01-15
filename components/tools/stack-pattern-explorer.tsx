"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopyButton } from "@/components/ui/copy-button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

type StackPattern = {
  id: string;
  title: string;
  stack: "Ruby/Rails" | "Java/Kotlin/Maven";
  category: string;
  description: string;
  whenToUse: string;
  bestPractices: string[];
  code: string;
  language: "ruby" | "kotlin" | "xml";
  tags: string[];
};

const patterns: StackPattern[] = [
  {
    id: "rails-service-objects",
    title: "Service Object for Business Logic",
    stack: "Ruby/Rails",
    category: "Architecture",
    description:
      "Keep controllers thin by extracting complex workflows into a single-purpose service class.",
    whenToUse:
      "Use when a request needs to coordinate multiple models, side effects, or validations beyond a single model method.",
    bestPractices: [
      "Expose a single entry point such as `call`.",
      "Return a predictable result object (success flag + payload).",
      "Wrap multi-write operations in a transaction.",
      "Keep service objects stateless and easy to test.",
    ],
    code: `# app/services/orders/create_order.rb
class Orders::CreateOrder
  def initialize(user:, params:)
    @user = user
    @params = params
  end

  def call
    Order.transaction do
      order = @user.orders.create!(@params)
      OrderMailer.confirmation(order.id).deliver_later
      Result.new(success: true, order: order)
    end
  rescue ActiveRecord::RecordInvalid => e
    Result.new(success: false, errors: e.record.errors.full_messages)
  end

  Result = Struct.new(:success, :order, :errors, keyword_init: true)
end

# controller
result = Orders::CreateOrder.new(user: current_user, params: order_params).call
render json: result.success ? result.order : { errors: result.errors }, status: result.success ? :created : :unprocessable_entity`,
    language: "ruby",
    tags: ["service objects", "transactions", "controllers"],
  },
  {
    id: "rails-query-optimization",
    title: "Query Optimization with Scopes",
    stack: "Ruby/Rails",
    category: "Data Access",
    description:
      "Define reusable scopes and preload associations to avoid N+1 queries while keeping queries readable.",
    whenToUse:
      "Use when building filtered lists or dashboards that need predictable, performant queries.",
    bestPractices: [
      "Keep scopes composable and side-effect free.",
      "Use `includes` or `preload` to prevent N+1 queries.",
      "Favor `select` for large tables to reduce payload size.",
      "Add database indexes for frequently filtered columns.",
    ],
    code: `# app/models/order.rb
class Order < ApplicationRecord
  scope :recent, -> { order(created_at: :desc) }
  scope :for_account, ->(account_id) { where(account_id: account_id) }
  scope :with_customer, -> { includes(:customer) }
end

# usage
orders = Order.for_account(params[:account_id])
  .recent
  .with_customer
  .select(:id, :total_cents, :customer_id, :created_at)`,
    language: "ruby",
    tags: ["active record", "scopes", "performance"],
  },
  {
    id: "rails-background-jobs",
    title: "Background Jobs with ActiveJob",
    stack: "Ruby/Rails",
    category: "Background Jobs",
    description:
      "Move long-running work out of web requests using ActiveJob and a queue adapter.",
    whenToUse:
      "Use when sending emails, processing files, or calling external APIs asynchronously.",
    bestPractices: [
      "Keep job arguments simple (IDs, not objects).",
      "Make jobs idempotent to handle retries safely.",
      "Add timeouts and error reporting for external calls.",
      "Use distinct queues for latency-sensitive work.",
    ],
    code: `# app/jobs/report_job.rb
class ReportJob < ApplicationJob
  queue_as :reports

  def perform(report_id)
    report = Report.find(report_id)
    ReportGenerator.new(report).call
  end
end

# enqueue
ReportJob.perform_later(report.id)`,
    language: "ruby",
    tags: ["active job", "queues", "async"],
  },
  {
    id: "kotlin-service-layer",
    title: "Service Layer with DTO Validation",
    stack: "Java/Kotlin/Maven",
    category: "Architecture",
    description:
      "Centralize business rules in services and validate request DTOs with Bean Validation.",
    whenToUse:
      "Use when you need consistent validation and a single place to coordinate repositories and integrations.",
    bestPractices: [
      "Annotate DTOs with validation rules (JSR 380).",
      "Keep controllers thin and delegate to services.",
      "Return domain objects from services, map to DTOs at the edge.",
      "Use constructor injection for testability.",
    ],
    code: `data class CreateOrderRequest(
  @field:NotBlank val customerId: String,
  @field:Positive val totalCents: Long
)

@Service
class OrderService(
  private val orderRepository: OrderRepository,
  private val validator: Validator
) {
  fun create(request: CreateOrderRequest): Order {
    validator.validate(request).takeIf { it.isEmpty() }
      ?: throw ConstraintViolationException("Invalid request", validator.validate(request))

    return orderRepository.save(
      Order(customerId = request.customerId, totalCents = request.totalCents)
    )
  }
}`,
    language: "kotlin",
    tags: ["service layer", "validation", "dto"],
  },
  {
    id: "maven-profiles",
    title: "Maven Profiles for Environments",
    stack: "Java/Kotlin/Maven",
    category: "Build & Config",
    description:
      "Use Maven profiles to separate dev/test/prod settings and avoid manual edits.",
    whenToUse:
      "Use when you need different configs for local dev, CI, or production builds.",
    bestPractices: [
      "Keep environment-specific values in profile properties.",
      "Document active profiles in README and CI configs.",
      "Avoid committing secrets; use env vars or a vault.",
      "Set a sensible default profile for local dev.",
    ],
    code: `<project>
  <profiles>
    <profile>
      <id>dev</id>
      <properties>
        <db.url>jdbc:postgresql://localhost:5432/dev_db</db.url>
      </properties>
    </profile>
    <profile>
      <id>prod</id>
      <properties>
        <db.url>\${env.DB_URL}</db.url>
      </properties>
    </profile>
  </profiles>
</project>`,
    language: "xml",
    tags: ["maven", "profiles", "configuration"],
  },
  {
    id: "kotlin-observability",
    title: "Structured Logging with Context",
    stack: "Java/Kotlin/Maven",
    category: "Observability",
    description:
      "Add consistent context (request IDs, user IDs) to logs for fast debugging.",
    whenToUse:
      "Use when troubleshooting production incidents or building dashboards that rely on log search.",
    bestPractices: [
      "Use MDC to attach per-request context.",
      "Log at the correct level to reduce noise.",
      "Emit structured JSON logs for centralized logging.",
      "Avoid logging sensitive values directly.",
    ],
    code: `import org.slf4j.LoggerFactory
import org.slf4j.MDC

val logger = LoggerFactory.getLogger("OrderController")

fun withRequestContext(requestId: String, userId: String, block: () -> Unit) {
  MDC.put("request_id", requestId)
  MDC.put("user_id", userId)
  try {
    block()
  } finally {
    MDC.clear()
  }
}

withRequestContext("req-123", "user-88") {
  logger.info("creating order")
}`,
    language: "kotlin",
    tags: ["logging", "mdc", "observability"],
  },
];

const stackOptions = ["All Stacks", "Ruby/Rails", "Java/Kotlin/Maven"] as const;

export function StackPatternExplorer() {
  const [stackFilter, setStackFilter] = useState<(typeof stackOptions)[number]>(
    "All Stacks",
  );
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    const unique = new Set(patterns.map((pattern) => pattern.category));
    return ["All Categories", ...Array.from(unique).sort()];
  }, []);

  const filteredPatterns = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return patterns.filter((pattern) => {
      const matchesStack =
        stackFilter === "All Stacks" || pattern.stack === stackFilter;
      const matchesCategory =
        categoryFilter === "All Categories" ||
        pattern.category === categoryFilter;
      const matchesQuery =
        !query ||
        [
          pattern.title,
          pattern.description,
          pattern.whenToUse,
          pattern.stack,
          pattern.category,
          ...pattern.bestPractices,
          ...pattern.tags,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesStack && matchesCategory && matchesQuery;
    });
  }, [stackFilter, categoryFilter, searchQuery]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Stack Pattern Explorer</CardTitle>
          <CardDescription>
            Browse proven patterns and best practices for Ruby/Rails and
            Java/Kotlin/Maven.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="stack-filter">Stack</Label>
            <Select
              value={stackFilter}
              onValueChange={(value) =>
                setStackFilter(value as (typeof stackOptions)[number])
              }
            >
              <SelectTrigger id="stack-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stackOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-filter">Category</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger id="category-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="search-patterns">Search</Label>
            <Input
              id="search-patterns"
              placeholder="Search patterns, tags, or best practices"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {filteredPatterns.map((pattern) => (
          <Card key={pattern.id}>
            <CardHeader>
              <CardTitle>{pattern.title}</CardTitle>
              <CardDescription>{pattern.description}</CardDescription>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border px-2 py-1">
                  {pattern.stack}
                </span>
                <span className="rounded-full border px-2 py-1">
                  {pattern.category}
                </span>
                {pattern.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-dashed px-2 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold">When to use</p>
                <p className="text-sm text-muted-foreground">
                  {pattern.whenToUse}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold">Best practices</p>
                <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                  {pattern.bestPractices.map((practice) => (
                    <li key={practice}>{practice}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Example</p>
                  <CopyButton
                    textToCopy={pattern.code}
                    showText
                    className="h-8 px-3"
                  />
                </div>
                <div className="overflow-hidden rounded-lg border">
                  <SyntaxHighlighter
                    language={pattern.language}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: "16px",
                      background: "transparent",
                      fontSize: "0.85rem",
                    }}
                  >
                    {pattern.code}
                  </SyntaxHighlighter>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatterns.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No patterns match your filters yet. Try another stack, category, or
            search term.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
