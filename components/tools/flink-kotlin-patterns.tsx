"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";

type Pattern = {
  id: string;
  title: string;
  description: string;
  code: string;
  category: string;
};

const patterns: Pattern[] = [
  // Data Sources
  {
    id: "kafka-source",
    title: "Kafka Source",
    category: "Sources",
    description: "Read data from Kafka using the Flink Kafka connector",
    code: `import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment
import org.apache.flink.connector.kafka.source.KafkaSource
import org.apache.flink.connector.kafka.source.enumerator.initializer.OffsetsInitializer
import org.apache.flink.api.common.serialization.SimpleStringSchema

val env = StreamExecutionEnvironment.getExecutionEnvironment()

val kafkaSource = KafkaSource.builder<String>()
    .setBootstrapServers("localhost:9092")
    .setTopics("input-topic")
    .setGroupId("my-consumer-group")
    .setStartingOffsets(OffsetsInitializer.earliest())
    .setValueOnlyDeserializer(SimpleStringSchema())
    .build()

val stream = env.fromSource(
    kafkaSource,
    WatermarkStrategy.noWatermarks(),
    "Kafka Source"
)`,
  },
  {
    id: "kafka-source-json",
    title: "Kafka Source with JSON",
    category: "Sources",
    description: "Read JSON data from Kafka and deserialize to data class",
    code: `import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment
import org.apache.flink.connector.kafka.source.KafkaSource
import org.apache.flink.connector.kafka.source.enumerator.initializer.OffsetsInitializer
import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.databind.ObjectMapper
import org.apache.flink.api.common.serialization.DeserializationSchema
import org.apache.flink.api.common.typeinfo.TypeInformation

data class Event(
    val id: String,
    val timestamp: Long,
    val value: Double
)

class JsonDeserializer : DeserializationSchema<Event> {
    private val mapper = ObjectMapper()

    override fun deserialize(message: ByteArray): Event {
        return mapper.readValue(message, Event::class.java)
    }

    override fun isEndOfStream(nextElement: Event) = false

    override fun getProducedType(): TypeInformation<Event> {
        return TypeInformation.of(Event::class.java)
    }
}

val kafkaSource = KafkaSource.builder<Event>()
    .setBootstrapServers("localhost:9092")
    .setTopics("events")
    .setGroupId("event-processor")
    .setStartingOffsets(OffsetsInitializer.latest())
    .setDeserializer(JsonDeserializer())
    .build()`,
  },
  // Transformations
  {
    id: "map-transform",
    title: "Map Transformation",
    category: "Transformations",
    description: "Transform stream elements using map operation",
    code: `data class User(val id: String, val name: String, val age: Int)
data class UserInfo(val id: String, val displayName: String)

val users: DataStream<User> = // ... source

val userInfo = users.map { user ->
    UserInfo(
        id = user.id,
        displayName = "\${user.name} (Age: \${user.age})"
    )
}`,
  },
  {
    id: "flatmap-transform",
    title: "FlatMap Transformation",
    category: "Transformations",
    description: "FlatMap to emit zero or more elements per input",
    code: `data class Sentence(val text: String)
data class Word(val word: String, val count: Int = 1)

val sentences: DataStream<Sentence> = // ... source

val words = sentences.flatMap { sentence ->
    sentence.text
        .split(" ")
        .filter { it.isNotBlank() }
        .map { Word(it.lowercase()) }
}`,
  },
  {
    id: "filter-transform",
    title: "Filter Transformation",
    category: "Transformations",
    description: "Filter stream elements based on predicate",
    code: `data class Transaction(
    val id: String,
    val amount: Double,
    val status: String
)

val transactions: DataStream<Transaction> = // ... source

// Filter for high-value completed transactions
val highValueTransactions = transactions
    .filter { it.status == "COMPLETED" }
    .filter { it.amount > 1000.0 }`,
  },
  // Windowing
  {
    id: "tumbling-window",
    title: "Tumbling Time Window",
    category: "Windows",
    description: "Aggregate events in fixed-size, non-overlapping windows",
    code: `import org.apache.flink.streaming.api.windowing.time.Time
import org.apache.flink.streaming.api.windowing.assigners.TumblingEventTimeWindows

data class Event(val userId: String, val value: Double, val timestamp: Long)
data class Aggregated(val userId: String, val sum: Double, val count: Long)

val events: DataStream<Event> = // ... source with watermarks

val aggregated = events
    .keyBy { it.userId }
    .window(TumblingEventTimeWindows.of(Time.minutes(5)))
    .reduce { acc, event ->
        Aggregated(
            userId = acc.userId,
            sum = acc.sum + event.value,
            count = acc.count + 1
        )
    }`,
  },
  {
    id: "sliding-window",
    title: "Sliding Time Window",
    category: "Windows",
    description: "Overlapping windows for continuous aggregations",
    code: `import org.apache.flink.streaming.api.windowing.time.Time
import org.apache.flink.streaming.api.windowing.assigners.SlidingEventTimeWindows

data class Metric(val sensor: String, val value: Double, val timestamp: Long)

val metrics: DataStream<Metric> = // ... source

// 10-minute window, sliding every 1 minute
val rollingAverage = metrics
    .keyBy { it.sensor }
    .window(
        SlidingEventTimeWindows.of(
            Time.minutes(10),  // window size
            Time.minutes(1)    // slide interval
        )
    )
    .aggregate(object : AggregateFunction<Metric, Pair<Double, Long>, Double> {
        override fun createAccumulator() = Pair(0.0, 0L)

        override fun add(value: Metric, acc: Pair<Double, Long>) =
            Pair(acc.first + value.value, acc.second + 1)

        override fun getResult(acc: Pair<Double, Long>) =
            if (acc.second > 0) acc.first / acc.second else 0.0

        override fun merge(a: Pair<Double, Long>, b: Pair<Double, Long>) =
            Pair(a.first + b.first, a.second + b.second)
    })`,
  },
  {
    id: "session-window",
    title: "Session Window",
    category: "Windows",
    description: "Group events by activity sessions with gaps",
    code: `import org.apache.flink.streaming.api.windowing.time.Time
import org.apache.flink.streaming.api.windowing.assigners.EventTimeSessionWindows

data class UserAction(val userId: String, val action: String, val timestamp: Long)
data class UserSession(val userId: String, val actions: List<String>, val duration: Long)

val actions: DataStream<UserAction> = // ... source

// Group actions with max 30-minute gap between events
val sessions = actions
    .keyBy { it.userId }
    .window(EventTimeSessionWindows.withGap(Time.minutes(30)))
    .process(object : ProcessWindowFunction<UserAction, UserSession, String, TimeWindow>() {
        override fun process(
            key: String,
            context: Context,
            elements: Iterable<UserAction>,
            out: Collector<UserSession>
        ) {
            val actionList = elements.map { it.action }
            val duration = context.window().end - context.window().start

            out.collect(UserSession(key, actionList, duration))
        }
    })`,
  },
  // State Management
  {
    id: "keyed-state",
    title: "Keyed State (ValueState)",
    category: "State",
    description: "Maintain per-key state across events",
    code: `import org.apache.flink.api.common.state.ValueState
import org.apache.flink.api.common.state.ValueStateDescriptor
import org.apache.flink.streaming.api.functions.KeyedProcessFunction
import org.apache.flink.util.Collector

data class Event(val userId: String, val value: Double)
data class EnrichedEvent(val userId: String, val value: Double, val runningTotal: Double)

class RunningTotalFunction : KeyedProcessFunction<String, Event, EnrichedEvent>() {
    private lateinit var totalState: ValueState<Double>

    override fun open(parameters: Configuration) {
        totalState = runtimeContext.getState(
            ValueStateDescriptor("running-total", Double::class.java)
        )
    }

    override fun processElement(
        event: Event,
        ctx: Context,
        out: Collector<EnrichedEvent>
    ) {
        val currentTotal = totalState.value() ?: 0.0
        val newTotal = currentTotal + event.value

        totalState.update(newTotal)

        out.collect(
            EnrichedEvent(
                userId = event.userId,
                value = event.value,
                runningTotal = newTotal
            )
        )
    }
}

val events: DataStream<Event> = // ... source
val enriched = events
    .keyBy { it.userId }
    .process(RunningTotalFunction())`,
  },
  {
    id: "list-state",
    title: "List State",
    category: "State",
    description: "Store a list of elements in state",
    code: `import org.apache.flink.api.common.state.ListState
import org.apache.flink.api.common.state.ListStateDescriptor

data class Event(val key: String, val value: String, val timestamp: Long)

class BufferingFunction : KeyedProcessFunction<String, Event, List<Event>>() {
    private lateinit var bufferedEvents: ListState<Event>

    override fun open(parameters: Configuration) {
        bufferedEvents = runtimeContext.getListState(
            ListStateDescriptor("event-buffer", Event::class.java)
        )
    }

    override fun processElement(
        event: Event,
        ctx: Context,
        out: Collector<List<Event>>
    ) {
        // Add to buffer
        bufferedEvents.add(event)

        // Get all buffered events
        val allEvents = bufferedEvents.get().toList()

        // Emit if buffer size reaches threshold
        if (allEvents.size >= 10) {
            out.collect(allEvents)
            bufferedEvents.clear()
        }
    }
}`,
  },
  // Watermarks
  {
    id: "watermark-bounded",
    title: "Bounded Out-of-Orderness Watermark",
    category: "Watermarks",
    description: "Handle late events with bounded delay",
    code: `import org.apache.flink.api.common.eventtime.WatermarkStrategy
import org.apache.flink.api.common.eventtime.SerializableTimestampAssigner
import java.time.Duration

data class Event(val id: String, val timestamp: Long, val value: Double)

val events: DataStream<Event> = // ... source

val withWatermarks = events.assignTimestampsAndWatermarks(
    WatermarkStrategy
        .forBoundedOutOfOrderness<Event>(Duration.ofSeconds(10))
        .withTimestampAssigner(SerializableTimestampAssigner { event, _ ->
            event.timestamp
        })
)`,
  },
  {
    id: "watermark-idle",
    title: "Watermark with Idle Source",
    category: "Watermarks",
    description: "Handle idle partitions in multi-partition sources",
    code: `import org.apache.flink.api.common.eventtime.WatermarkStrategy
import java.time.Duration

data class Event(val partition: Int, val timestamp: Long, val data: String)

val watermarkStrategy = WatermarkStrategy
    .forBoundedOutOfOrderness<Event>(Duration.ofSeconds(5))
    .withIdleness(Duration.ofMinutes(1))  // Mark partition idle after 1 min
    .withTimestampAssigner { event, _ -> event.timestamp }

val events = env
    .fromSource(kafkaSource, watermarkStrategy, "Kafka Source")`,
  },
  // Sinks
  {
    id: "kafka-sink",
    title: "Kafka Sink",
    category: "Sinks",
    description: "Write data to Kafka topic",
    code: `import org.apache.flink.connector.kafka.sink.KafkaRecordSerializationSchema
import org.apache.flink.connector.kafka.sink.KafkaSink
import org.apache.flink.api.common.serialization.SimpleStringSchema

data class OutputEvent(val key: String, val value: String)

val outputStream: DataStream<OutputEvent> = // ... processed stream

val kafkaSink = KafkaSink.builder<String>()
    .setBootstrapServers("localhost:9092")
    .setRecordSerializer(
        KafkaRecordSerializationSchema.builder()
            .setTopic("output-topic")
            .setValueSerializationSchema(SimpleStringSchema())
            .build()
    )
    .build()

outputStream
    .map { it.value }
    .sinkTo(kafkaSink)`,
  },
  {
    id: "kafka-sink-json",
    title: "Kafka Sink with JSON",
    category: "Sinks",
    description: "Serialize data class to JSON and write to Kafka",
    code: `import org.apache.flink.connector.kafka.sink.KafkaRecordSerializationSchema
import org.apache.flink.connector.kafka.sink.KafkaSink
import org.apache.flink.api.common.serialization.SerializationSchema
import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.databind.ObjectMapper
import org.apache.kafka.clients.producer.ProducerRecord

data class Result(val id: String, val status: String, val value: Double)

class JsonSerializationSchema : SerializationSchema<Result> {
    private val mapper = ObjectMapper()

    override fun serialize(element: Result): ByteArray {
        return mapper.writeValueAsBytes(element)
    }
}

val results: DataStream<Result> = // ... processed stream

val kafkaSink = KafkaSink.builder<Result>()
    .setBootstrapServers("localhost:9092")
    .setRecordSerializer(
        KafkaRecordSerializationSchema.builder()
            .setTopic("results")
            .setValueSerializationSchema(JsonSerializationSchema())
            .setKeySerializationSchema { result ->
                result.id.toByteArray()
            }
            .build()
    )
    .build()

results.sinkTo(kafkaSink)`,
  },
  // Joins
  {
    id: "stream-join",
    title: "Stream Join",
    category: "Joins",
    description: "Join two streams within a time window",
    code: `import org.apache.flink.streaming.api.windowing.time.Time

data class Click(val userId: String, val pageId: String, val timestamp: Long)
data class Purchase(val userId: String, val itemId: String, val amount: Double, val timestamp: Long)
data class Conversion(val userId: String, val pageId: String, val itemId: String, val amount: Double)

val clicks: DataStream<Click> = // ... source with watermarks
val purchases: DataStream<Purchase> = // ... source with watermarks

val conversions = clicks
    .join(purchases)
    .where { it.userId }
    .equalTo { it.userId }
    .window(TumblingEventTimeWindows.of(Time.minutes(30)))
    .apply { click, purchase ->
        Conversion(
            userId = click.userId,
            pageId = click.pageId,
            itemId = purchase.itemId,
            amount = purchase.amount
        )
    }`,
  },
  {
    id: "interval-join",
    title: "Interval Join",
    category: "Joins",
    description: "Join events within a time interval",
    code: `import org.apache.flink.streaming.api.functions.co.ProcessJoinFunction
import org.apache.flink.streaming.api.windowing.time.Time

data class Order(val orderId: String, val userId: String, val timestamp: Long)
data class Payment(val paymentId: String, val orderId: String, val timestamp: Long)
data class CompletedOrder(val orderId: String, val paymentId: String)

val orders: DataStream<Order> = // ... source with watermarks
val payments: DataStream<Payment> = // ... source with watermarks

// Join payments that arrive within 1 hour after order
val completed = orders
    .keyBy { it.orderId }
    .intervalJoin(payments.keyBy { it.orderId })
    .between(Time.seconds(0), Time.hours(1))
    .process(object : ProcessJoinFunction<Order, Payment, CompletedOrder>() {
        override fun processElement(
            order: Order,
            payment: Payment,
            ctx: Context,
            out: Collector<CompletedOrder>
        ) {
            out.collect(CompletedOrder(order.orderId, payment.paymentId))
        }
    })`,
  },
  // Advanced Patterns
  {
    id: "cep-pattern",
    title: "Complex Event Processing (CEP)",
    category: "Advanced",
    description: "Detect patterns in event streams",
    code: `import org.apache.flink.cep.CEP
import org.apache.flink.cep.PatternStream
import org.apache.flink.cep.pattern.Pattern
import org.apache.flink.cep.pattern.conditions.SimpleCondition

data class LoginEvent(val userId: String, val success: Boolean, val timestamp: Long)
data class Alert(val userId: String, val message: String)

val loginEvents: DataStream<LoginEvent> = // ... source

// Pattern: 3 failed login attempts within 5 minutes
val failurePattern = Pattern
    .begin<LoginEvent>("first-failure")
    .where(object : SimpleCondition<LoginEvent>() {
        override fun filter(event: LoginEvent) = !event.success
    })
    .next("second-failure")
    .where(object : SimpleCondition<LoginEvent>() {
        override fun filter(event: LoginEvent) = !event.success
    })
    .next("third-failure")
    .where(object : SimpleCondition<LoginEvent>() {
        override fun filter(event: LoginEvent) = !event.success
    })
    .within(Time.minutes(5))

val patternStream: PatternStream<LoginEvent> = CEP.pattern(
    loginEvents.keyBy { it.userId },
    failurePattern
)

val alerts = patternStream.select { pattern ->
    val firstFailure = pattern["first-failure"]!!.first()
    Alert(
        userId = firstFailure.userId,
        message = "3 failed login attempts detected"
    )
}`,
  },
  {
    id: "async-io",
    title: "Async I/O for Enrichment",
    category: "Advanced",
    description: "Enrich stream with external data asynchronously",
    code: `import org.apache.flink.streaming.api.functions.async.AsyncFunction
import org.apache.flink.streaming.api.functions.async.ResultFuture
import org.apache.flink.streaming.api.scala.async.AsyncDataStream
import java.util.concurrent.CompletableFuture
import java.time.Duration

data class Event(val userId: String, val action: String)
data class EnrichedEvent(val userId: String, val action: String, val userName: String)

class AsyncDatabaseEnrichment : AsyncFunction<Event, EnrichedEvent> {

    override fun asyncInvoke(
        event: Event,
        resultFuture: ResultFuture<EnrichedEvent>
    ) {
        CompletableFuture.supplyAsync {
            // Simulate async database call
            fetchUserName(event.userId)
        }.thenAccept { userName ->
            resultFuture.complete(
                listOf(
                    EnrichedEvent(
                        userId = event.userId,
                        action = event.action,
                        userName = userName
                    )
                )
            )
        }
    }

    private fun fetchUserName(userId: String): String {
        // Call external database/API
        return "User_\${userId}"
    }
}

val events: DataStream<Event> = // ... source

val enriched = AsyncDataStream.unorderedWait(
    events,
    AsyncDatabaseEnrichment(),
    Duration.ofSeconds(5).toMillis(),
    java.util.concurrent.TimeUnit.MILLISECONDS,
    100  // max concurrent requests
)`,
  },
];

const categories = Array.from(new Set(patterns.map(p => p.category)));

export function FlinkKotlinPatterns() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern>(patterns[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(selectedPattern.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <div className="lg:col-span-3 space-y-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {selectedPattern.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedPattern.description}
              </p>
            </div>
            <Button
              onClick={handleCopy}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code className="text-foreground font-mono">{selectedPattern.code}</code>
            </pre>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="p-4 bg-card border-border">
          <p className="text-sm font-medium text-foreground mb-4">Pattern Library</p>
          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
            {categories.map((category) => (
              <div key={category}>
                <p className="font-medium mb-2 text-foreground text-sm">{category}</p>
                <div className="space-y-1">
                  {patterns
                    .filter((p) => p.category === category)
                    .map((pattern) => (
                      <button
                        key={pattern.id}
                        onClick={() => setSelectedPattern(pattern)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          selectedPattern.id === pattern.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        {pattern.title}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
