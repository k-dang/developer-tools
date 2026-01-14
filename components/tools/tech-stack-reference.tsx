"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyButton } from "@/components/ui/copy-button";

type Language = "ruby" | "kotlin" | "bash" | "xml" | "yaml";

type Pattern = {
  id: string;
  title: string;
  description: string;
  usage: string;
  code: string;
  category: string;
  language: Language;
};

type TechStack = {
  id: string;
  name: string;
  description: string;
  patterns: Pattern[];
};

const techStacks: TechStack[] = [
  {
    id: "ruby-rails",
    name: "Ruby / Rails",
    description: "Ruby on Rails patterns, commands, and best practices",
    patterns: [
      // Rails Commands
      {
        id: "rails-new",
        title: "Create New Rails App",
        category: "Rails Commands",
        description: "Generate a new Rails application with common options",
        usage: "Use this to scaffold a new Rails project with database, testing framework, and API mode options.",
        language: "bash",
        code: `# Basic Rails app
rails new myapp

# Rails API-only app
rails new myapp --api

# With PostgreSQL
rails new myapp --database=postgresql

# Skip Test::Unit (use RSpec instead)
rails new myapp --skip-test

# Multiple options
rails new myapp --database=postgresql --skip-test --api`,
      },
      {
        id: "rails-generate",
        title: "Rails Generators",
        category: "Rails Commands",
        description: "Common Rails generator commands",
        usage: "Quickly scaffold models, controllers, migrations, and more. Saves time and follows Rails conventions.",
        language: "bash",
        code: `# Generate model with attributes
rails generate model User name:string email:string age:integer

# Generate controller with actions
rails generate controller Users index show create

# Generate migration
rails generate migration AddAdminToUsers admin:boolean

# Generate scaffold (model + views + controller)
rails generate scaffold Article title:string body:text published:boolean

# Generate mailer
rails generate mailer UserMailer welcome_email password_reset`,
      },
      {
        id: "rails-console",
        title: "Rails Console & Debugging",
        category: "Rails Commands",
        description: "Interactive Rails console commands",
        usage: "Essential for debugging, testing queries, and exploring your Rails application data.",
        language: "bash",
        code: `# Start Rails console
rails console
# or shorthand
rails c

# Production console
rails console production

# Sandbox mode (rollback all changes on exit)
rails console --sandbox

# Run Rails server
rails server
# or shorthand
rails s

# Run on specific port
rails s -p 3001

# Run database migrations
rails db:migrate

# Rollback last migration
rails db:rollback

# Reset database
rails db:reset`,
      },
      // Active Record Queries
      {
        id: "activerecord-queries",
        title: "Active Record Queries",
        category: "Active Record",
        description: "Common Active Record query patterns",
        usage: "Use these patterns for database queries in Rails. Active Record provides a rich DSL for building SQL queries.",
        language: "ruby",
        code: `# Find by ID
user = User.find(1)

# Find by attribute
user = User.find_by(email: 'user@example.com')

# Where clause
users = User.where(active: true)
users = User.where("age > ?", 18)

# Multiple conditions
users = User.where(active: true, role: 'admin')

# Order
users = User.order(created_at: :desc)
users = User.order('name ASC, created_at DESC')

# Limit and offset
users = User.limit(10).offset(20)

# Select specific columns
users = User.select(:id, :name, :email)

# Joins
posts = Post.joins(:user).where(users: { active: true })

# Includes (eager loading to avoid N+1)
posts = Post.includes(:comments, :user)

# Count and aggregations
user_count = User.count
average_age = User.average(:age)
total_orders = Order.sum(:amount)`,
      },
      {
        id: "activerecord-associations",
        title: "Active Record Associations",
        category: "Active Record",
        description: "Define relationships between models",
        usage: "Associations are crucial for modeling relationships in Rails. They provide powerful query methods and maintain referential integrity.",
        language: "ruby",
        code: `# app/models/user.rb
class User < ApplicationRecord
  # One-to-many
  has_many :posts
  has_many :comments

  # One-to-many with dependent destroy
  has_many :orders, dependent: :destroy

  # One-to-one
  has_one :profile, dependent: :destroy

  # Many-to-many (through join table)
  has_many :enrollments
  has_many :courses, through: :enrollments

  # Polymorphic association
  has_many :images, as: :imageable
end

# app/models/post.rb
class Post < ApplicationRecord
  # Belongs to
  belongs_to :user

  # Optional belongs_to (Rails 5+)
  belongs_to :category, optional: true

  # Has many
  has_many :comments, dependent: :destroy

  # Counter cache
  belongs_to :user, counter_cache: true
end

# Usage examples
user = User.find(1)
user.posts.create(title: "My Post", body: "Content")
user.posts.count
user.posts.where(published: true)`,
      },
      {
        id: "activerecord-validations",
        title: "Active Record Validations",
        category: "Active Record",
        description: "Model validation patterns",
        usage: "Validations ensure data integrity before saving to the database. Essential for maintaining clean data.",
        language: "ruby",
        code: `class User < ApplicationRecord
  # Presence validation
  validates :name, presence: true
  validates :email, :password, presence: true

  # Uniqueness validation
  validates :email, uniqueness: true
  validates :username, uniqueness: { case_sensitive: false }

  # Length validation
  validates :password, length: { minimum: 8 }
  validates :bio, length: { maximum: 500 }
  validates :username, length: { in: 3..20 }

  # Format validation (regex)
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :phone, format: { with: /\A\d{10}\z/ }

  # Numericality validation
  validates :age, numericality: { greater_than: 0 }
  validates :price, numericality: { greater_than_or_equal_to: 0 }

  # Inclusion/Exclusion
  validates :role, inclusion: { in: %w[admin user guest] }
  validates :subdomain, exclusion: { in: %w[www admin] }

  # Confirmation validation
  validates :email, confirmation: true
  validates :email_confirmation, presence: true

  # Custom validation
  validate :custom_validation_method

  private

  def custom_validation_method
    if age.present? && age < 18
      errors.add(:age, "must be 18 or older")
    end
  end
end`,
      },
      // Migrations
      {
        id: "rails-migrations",
        title: "Database Migrations",
        category: "Migrations",
        description: "Common migration patterns",
        usage: "Migrations are version control for your database. Use them to modify database schema over time.",
        language: "ruby",
        code: `# Create table
class CreateUsers < ActiveRecord::Migration[7.0]
  def change
    create_table :users do |t|
      t.string :name, null: false
      t.string :email, null: false
      t.integer :age
      t.boolean :active, default: true
      t.text :bio

      t.timestamps
    end

    add_index :users, :email, unique: true
  end
end

# Add column
class AddAdminToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :admin, :boolean, default: false
  end
end

# Add reference (foreign key)
class AddUserRefToPosts < ActiveRecord::Migration[7.0]
  def change
    add_reference :posts, :user, foreign_key: true
  end
end

# Change column
class ChangeUserNameToNotNull < ActiveRecord::Migration[7.0]
  def change
    change_column_null :users, :name, false
    change_column_default :users, :active, from: nil, to: true
  end
end

# Rename column
class RenameUserEmailToEmailAddress < ActiveRecord::Migration[7.0]
  def change
    rename_column :users, :email, :email_address
  end
end

# Remove column
class RemoveBioFromUsers < ActiveRecord::Migration[7.0]
  def change
    remove_column :users, :bio, :text
  end
end`,
      },
      // Routes
      {
        id: "rails-routes",
        title: "Rails Routes",
        category: "Routes",
        description: "Route configuration patterns",
        usage: "Routes map URLs to controller actions. RESTful routes follow Rails conventions for CRUD operations.",
        language: "ruby",
        code: `# config/routes.rb
Rails.application.routes.draw do
  # Root route
  root 'home#index'

  # RESTful resources (7 routes: index, new, create, show, edit, update, destroy)
  resources :posts

  # Limit actions
  resources :users, only: [:index, :show]
  resources :comments, except: [:destroy]

  # Nested resources
  resources :posts do
    resources :comments
  end

  # Shallow nesting (recommended for deep nesting)
  resources :posts do
    resources :comments, shallow: true
  end

  # Custom member and collection routes
  resources :posts do
    member do
      post 'publish'
      delete 'archive'
    end

    collection do
      get 'search'
    end
  end

  # Namespace
  namespace :admin do
    resources :users
    resources :posts
  end

  # API versioning
  namespace :api do
    namespace :v1 do
      resources :users
    end
  end

  # Custom routes
  get '/about', to: 'pages#about'
  post '/contact', to: 'pages#contact'

  # Route constraints
  get '/posts/:id', to: 'posts#show', constraints: { id: /\d+/ }
end`,
      },
      // Controllers
      {
        id: "rails-controllers",
        title: "Rails Controllers",
        category: "Controllers",
        description: "Controller patterns and best practices",
        usage: "Controllers handle requests, interact with models, and render responses. Follow REST conventions for clean, maintainable code.",
        language: "ruby",
        code: `class PostsController < ApplicationController
  before_action :set_post, only: [:show, :edit, :update, :destroy]
  before_action :authenticate_user!, except: [:index, :show]

  # GET /posts
  def index
    @posts = Post.includes(:user).order(created_at: :desc)

    # Pagination example (with kaminari gem)
    # @posts = Post.page(params[:page]).per(10)
  end

  # GET /posts/:id
  def show
    # @post loaded by before_action
  end

  # GET /posts/new
  def new
    @post = Post.new
  end

  # POST /posts
  def create
    @post = current_user.posts.build(post_params)

    if @post.save
      redirect_to @post, notice: 'Post created successfully.'
    else
      render :new, status: :unprocessable_entity
    end
  end

  # GET /posts/:id/edit
  def edit
    # @post loaded by before_action
  end

  # PATCH/PUT /posts/:id
  def update
    if @post.update(post_params)
      redirect_to @post, notice: 'Post updated successfully.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  # DELETE /posts/:id
  def destroy
    @post.destroy
    redirect_to posts_url, notice: 'Post deleted successfully.'
  end

  private

  def set_post
    @post = Post.find(params[:id])
  end

  def post_params
    params.require(:post).permit(:title, :body, :published)
  end
end`,
      },
      // Bundler & Gems
      {
        id: "bundler-basics",
        title: "Bundler & Gemfile",
        category: "Bundler",
        description: "Dependency management with Bundler",
        usage: "Bundler manages gem dependencies for your Ruby project. The Gemfile specifies which gems your app needs.",
        language: "ruby",
        code: `# Gemfile
source 'https://rubygems.org'
ruby '3.3.0'

# Rails framework
gem 'rails', '~> 7.1.0'

# Database
gem 'pg', '~> 1.5'  # PostgreSQL

# Web server
gem 'puma', '~> 6.0'

# Asset pipeline
gem 'sprockets-rails'
gem 'importmap-rails'

# JSON API
gem 'jbuilder'

# Authentication
gem 'devise', '~> 4.9'

# Authorization
gem 'pundit', '~> 2.3'

# Pagination
gem 'kaminari', '~> 1.2'

# Background jobs
gem 'sidekiq', '~> 7.0'

# Environment variables
gem 'dotenv-rails', groups: [:development, :test]

group :development, :test do
  gem 'debug'
  gem 'rspec-rails', '~> 6.0'
  gem 'factory_bot_rails'
  gem 'faker'
end

group :development do
  gem 'web-console'
  gem 'rubocop', require: false
  gem 'bullet'  # N+1 query detector
end

group :test do
  gem 'capybara'
  gem 'selenium-webdriver'
end`,
      },
      {
        id: "bundler-commands",
        title: "Bundler Commands",
        category: "Bundler",
        description: "Common Bundler commands",
        usage: "Essential commands for managing Ruby dependencies with Bundler.",
        language: "bash",
        code: `# Install all gems from Gemfile
bundle install

# Update all gems
bundle update

# Update specific gem
bundle update rails

# Install to vendor/bundle (local)
bundle install --path vendor/bundle

# Install without development/test gems
bundle install --without development test

# Show outdated gems
bundle outdated

# Execute command with Bundler environment
bundle exec rails server
bundle exec rspec
bundle exec rake db:migrate

# Check for security vulnerabilities
bundle audit

# Show gem dependency tree
bundle viz

# Clean up unused gems
bundle clean`,
      },
    ],
  },
  {
    id: "kotlin-maven",
    name: "Kotlin / Maven",
    description: "Kotlin with Maven build patterns and best practices",
    patterns: [
      // Maven Commands
      {
        id: "maven-lifecycle",
        title: "Maven Lifecycle Commands",
        category: "Maven Commands",
        description: "Core Maven build lifecycle commands",
        usage: "These commands cover the entire Maven build lifecycle from compiling to deploying your application.",
        language: "bash",
        code: `# Clean build artifacts
mvn clean

# Compile source code
mvn compile

# Run tests
mvn test

# Package as JAR/WAR
mvn package

# Install to local repository
mvn install

# Deploy to remote repository
mvn deploy

# Common combinations
mvn clean install
mvn clean package
mvn clean test

# Skip tests
mvn install -DskipTests
mvn package -Dmaven.test.skip=true

# Run specific test
mvn test -Dtest=UserServiceTest
mvn test -Dtest=UserServiceTest#testCreateUser

# Run with specific profile
mvn install -Pproduction

# Verbose output
mvn install -X

# Offline mode
mvn install -o`,
      },
      {
        id: "maven-dependency",
        title: "Maven Dependency Commands",
        category: "Maven Commands",
        description: "Manage project dependencies",
        usage: "Use these commands to analyze, update, and troubleshoot Maven dependencies.",
        language: "bash",
        code: `# Display dependency tree
mvn dependency:tree

# Display dependency tree for specific scope
mvn dependency:tree -Dscope=compile
mvn dependency:tree -Dscope=runtime

# Analyze dependencies
mvn dependency:analyze

# Resolve dependencies
mvn dependency:resolve

# Copy dependencies to target/dependency
mvn dependency:copy-dependencies

# Display effective POM
mvn help:effective-pom

# Display active profiles
mvn help:active-profiles

# Update project version
mvn versions:set -DnewVersion=2.0.0

# Check for dependency updates
mvn versions:display-dependency-updates

# Check for plugin updates
mvn versions:display-plugin-updates`,
      },
      // POM.xml Patterns
      {
        id: "pom-basic",
        title: "Basic POM.xml Structure",
        category: "POM Configuration",
        description: "Essential pom.xml configuration for Kotlin project",
        usage: "Starting template for a Kotlin Maven project with common plugins and dependencies.",
        language: "xml",
        code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>my-kotlin-app</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>My Kotlin Application</name>
    <description>A Kotlin application with Maven</description>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <kotlin.version>1.9.22</kotlin.version>
        <kotlin.code.style>official</kotlin.code.style>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>

    <dependencies>
        <!-- Kotlin Standard Library -->
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-stdlib</artifactId>
            <version>\${kotlin.version}</version>
        </dependency>

        <!-- Kotlin Test -->
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-test-junit5</artifactId>
            <version>\${kotlin.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <sourceDirectory>\${project.basedir}/src/main/kotlin</sourceDirectory>
        <testSourceDirectory>\${project.basedir}/src/test/kotlin</testSourceDirectory>

        <plugins>
            <plugin>
                <groupId>org.jetbrains.kotlin</groupId>
                <artifactId>kotlin-maven-plugin</artifactId>
                <version>\${kotlin.version}</version>
                <executions>
                    <execution>
                        <id>compile</id>
                        <goals>
                            <goal>compile</goal>
                        </goals>
                    </execution>
                    <execution>
                        <id>test-compile</id>
                        <goals>
                            <goal>test-compile</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>`,
      },
      {
        id: "pom-dependencies",
        title: "Common Kotlin Dependencies",
        category: "POM Configuration",
        description: "Popular dependencies for Kotlin projects",
        usage: "Add these dependencies for common Kotlin development needs like coroutines, serialization, and HTTP clients.",
        language: "xml",
        code: `<properties>
    <kotlin.version>1.9.22</kotlin.version>
    <ktor.version>2.3.7</ktor.version>
    <coroutines.version>1.7.3</coroutines.version>
</properties>

<dependencies>
    <!-- Kotlin Coroutines -->
    <dependency>
        <groupId>org.jetbrains.kotlinx</groupId>
        <artifactId>kotlinx-coroutines-core</artifactId>
        <version>\${coroutines.version}</version>
    </dependency>

    <!-- Kotlin Serialization -->
    <dependency>
        <groupId>org.jetbrains.kotlinx</groupId>
        <artifactId>kotlinx-serialization-json</artifactId>
        <version>1.6.2</version>
    </dependency>

    <!-- Ktor Client (HTTP) -->
    <dependency>
        <groupId>io.ktor</groupId>
        <artifactId>ktor-client-core</artifactId>
        <version>\${ktor.version}</version>
    </dependency>
    <dependency>
        <groupId>io.ktor</groupId>
        <artifactId>ktor-client-cio</artifactId>
        <version>\${ktor.version}</version>
    </dependency>

    <!-- Logging -->
    <dependency>
        <groupId>io.github.microutils</groupId>
        <artifactId>kotlin-logging-jvm</artifactId>
        <version>3.0.5</version>
    </dependency>
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>1.4.14</version>
    </dependency>

    <!-- Testing -->
    <dependency>
        <groupId>io.kotest</groupId>
        <artifactId>kotest-runner-junit5</artifactId>
        <version>5.8.0</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>io.mockk</groupId>
        <artifactId>mockk</artifactId>
        <version>1.13.9</version>
        <scope>test</scope>
    </dependency>
</dependencies>`,
      },
      {
        id: "pom-spring-boot",
        title: "Spring Boot with Kotlin",
        category: "POM Configuration",
        description: "POM configuration for Spring Boot Kotlin project",
        usage: "Use this template when building a Spring Boot application with Kotlin. Includes essential Spring Boot starters.",
        language: "xml",
        code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.1</version>
    </parent>

    <groupId>com.example</groupId>
    <artifactId>spring-kotlin-app</artifactId>
    <version>1.0.0</version>

    <properties>
        <kotlin.version>1.9.22</kotlin.version>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring Boot Data JPA -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <!-- Kotlin -->
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-reflect</artifactId>
        </dependency>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-stdlib</artifactId>
        </dependency>

        <!-- Jackson Kotlin Module -->
        <dependency>
            <groupId>com.fasterxml.jackson.module</groupId>
            <artifactId>jackson-module-kotlin</artifactId>
        </dependency>

        <!-- Database -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <sourceDirectory>\${project.basedir}/src/main/kotlin</sourceDirectory>
        <testSourceDirectory>\${project.basedir}/src/test/kotlin</testSourceDirectory>

        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
            <plugin>
                <groupId>org.jetbrains.kotlin</groupId>
                <artifactId>kotlin-maven-plugin</artifactId>
                <configuration>
                    <args>
                        <arg>-Xjsr305=strict</arg>
                    </args>
                    <compilerPlugins>
                        <plugin>spring</plugin>
                        <plugin>jpa</plugin>
                    </compilerPlugins>
                </configuration>
                <dependencies>
                    <dependency>
                        <groupId>org.jetbrains.kotlin</groupId>
                        <artifactId>kotlin-maven-allopen</artifactId>
                        <version>\${kotlin.version}</version>
                    </dependency>
                    <dependency>
                        <groupId>org.jetbrains.kotlin</groupId>
                        <artifactId>kotlin-maven-noarg</artifactId>
                        <version>\${kotlin.version}</version>
                    </dependency>
                </dependencies>
            </plugin>
        </plugins>
    </build>
</project>`,
      },
      // Kotlin Patterns
      {
        id: "kotlin-data-class",
        title: "Data Classes",
        category: "Kotlin Basics",
        description: "Kotlin data class patterns",
        usage: "Data classes automatically generate equals(), hashCode(), toString(), copy(), and component functions. Perfect for DTOs and value objects.",
        language: "kotlin",
        code: `// Basic data class
data class User(
    val id: Long,
    val name: String,
    val email: String,
    val age: Int
)

// Usage
val user = User(1, "John Doe", "john@example.com", 30)

// Auto-generated toString()
println(user)  // User(id=1, name=John Doe, email=john@example.com, age=30)

// Auto-generated copy()
val updatedUser = user.copy(age = 31)

// Destructuring
val (id, name, email, age) = user

// Data class with defaults
data class Settings(
    val theme: String = "light",
    val notifications: Boolean = true,
    val language: String = "en"
)

// Nested data classes
data class Address(val street: String, val city: String, val zip: String)
data class Person(
    val name: String,
    val address: Address
)

// Data class with validation
data class Email(val value: String) {
    init {
        require(value.contains("@")) { "Invalid email format" }
    }
}`,
      },
      {
        id: "kotlin-null-safety",
        title: "Null Safety",
        category: "Kotlin Basics",
        description: "Kotlin's null safety features",
        usage: "Kotlin's type system distinguishes nullable and non-nullable types, preventing null pointer exceptions at compile time.",
        language: "kotlin",
        code: `// Non-nullable type (default)
val name: String = "John"
// name = null  // Compilation error

// Nullable type
val nullableName: String? = null

// Safe call operator (?.)
val length = nullableName?.length  // Returns null if nullableName is null

// Elvis operator (?:)
val len = nullableName?.length ?: 0  // Default value if null

// Safe cast (as?)
val obj: Any = "Hello"
val str: String? = obj as? String  // null if cast fails

// Not-null assertion (!!)
val nonNull = nullableName!!  // Throws NPE if null (use sparingly)

// Let function with safe call
nullableName?.let { name ->
    println("Name is $name")
    // This block only executes if name is not null
}

// Null checks
if (nullableName != null) {
    // Smart cast: nullableName is treated as non-null here
    println(nullableName.length)
}

// Multiple null checks
val person: Person? = getPerson()
val city = person?.address?.city ?: "Unknown"`,
      },
      {
        id: "kotlin-collections",
        title: "Collection Operations",
        category: "Kotlin Basics",
        description: "Functional collection operations in Kotlin",
        usage: "Kotlin provides rich collection APIs for functional-style data manipulation. More concise and expressive than loops.",
        language: "kotlin",
        code: `val numbers = listOf(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)

// Filter
val evenNumbers = numbers.filter { it % 2 == 0 }

// Map
val squared = numbers.map { it * it }

// Filter and map
val evenSquared = numbers
    .filter { it % 2 == 0 }
    .map { it * it }

// Find
val firstEven = numbers.find { it % 2 == 0 }
val firstOrNull = numbers.firstOrNull { it > 100 }

// Any, All, None
val hasEven = numbers.any { it % 2 == 0 }
val allPositive = numbers.all { it > 0 }
val noneNegative = numbers.none { it < 0 }

// GroupBy
val grouped = numbers.groupBy { it % 3 }
// Result: {1=[1, 4, 7, 10], 2=[2, 5, 8], 0=[3, 6, 9]}

// Partition
val (even, odd) = numbers.partition { it % 2 == 0 }

// Reduce and Fold
val sum = numbers.reduce { acc, num -> acc + num }
val sumWithInitial = numbers.fold(100) { acc, num -> acc + num }

// FlatMap
val nestedLists = listOf(listOf(1, 2), listOf(3, 4), listOf(5, 6))
val flattened = nestedLists.flatMap { it }  // [1, 2, 3, 4, 5, 6]

// Distinct, sorted
val unique = listOf(1, 2, 2, 3, 3, 3).distinct()
val sorted = numbers.sortedDescending()

// Take, drop
val firstThree = numbers.take(3)
val skipTwo = numbers.drop(2)`,
      },
      {
        id: "kotlin-extension",
        title: "Extension Functions",
        category: "Kotlin Advanced",
        description: "Extend existing classes with new functions",
        usage: "Extension functions let you add functionality to existing classes without inheritance. Great for utility functions and DSLs.",
        language: "kotlin",
        code: `// Extension function on String
fun String.isValidEmail(): Boolean {
    return this.contains("@") && this.contains(".")
}

// Usage
val email = "user@example.com"
if (email.isValidEmail()) {
    println("Valid email")
}

// Extension function with generics
fun <T> List<T>.secondOrNull(): T? {
    return if (this.size >= 2) this[1] else null
}

// Extension property
val String.wordCount: Int
    get() = this.split("\\s+".toRegex()).size

// Usage
val text = "Hello world from Kotlin"
println(text.wordCount)  // 4

// Extension on nullable type
fun String?.orDefault(default: String): String {
    return this ?: default
}

// Usage
val nullString: String? = null
println(nullString.orDefault("N/A"))  // N/A

// Extension for collections
fun <T> List<T>.randomElement(): T? {
    return if (isEmpty()) null else this.random()
}

// Infix extension function
infix fun Int.pow(exponent: Int): Int {
    return Math.pow(this.toDouble(), exponent.toDouble()).toInt()
}

// Usage
val result = 2 pow 8  // 256`,
      },
      {
        id: "kotlin-coroutines",
        title: "Kotlin Coroutines Basics",
        category: "Kotlin Advanced",
        description: "Asynchronous programming with coroutines",
        usage: "Coroutines provide a way to write asynchronous code that looks sequential. Essential for non-blocking I/O operations.",
        language: "kotlin",
        code: `import kotlinx.coroutines.*

// Launch a coroutine
fun main() = runBlocking {
    launch {
        delay(1000L)
        println("World!")
    }
    println("Hello")
}

// Async and await
suspend fun fetchUser(id: Int): User {
    delay(1000)  // Simulate network call
    return User(id, "User $id")
}

fun loadData() = runBlocking {
    val user1 = async { fetchUser(1) }
    val user2 = async { fetchUser(2) }

    // Wait for both to complete
    val users = listOf(user1.await(), user2.await())
    println(users)
}

// Coroutine scope
class UserRepository {
    private val scope = CoroutineScope(Dispatchers.IO)

    fun loadUsers() {
        scope.launch {
            val users = fetchUsers()
            withContext(Dispatchers.Main) {
                updateUI(users)
            }
        }
    }
}

// Exception handling
fun handleErrors() = runBlocking {
    try {
        coroutineScope {
            launch {
                throw Exception("Error in coroutine")
            }
        }
    } catch (e: Exception) {
        println("Caught: \${e.message}")
    }
}

// Flow (reactive streams)
fun getNumbers(): Flow<Int> = flow {
    for (i in 1..5) {
        delay(100)
        emit(i)
    }
}

fun collectFlow() = runBlocking {
    getNumbers().collect { value ->
        println(value)
    }
}`,
      },
      {
        id: "kotlin-sealed-class",
        title: "Sealed Classes",
        category: "Kotlin Advanced",
        description: "Restricted class hierarchies",
        usage: "Sealed classes represent restricted hierarchies. Perfect for modeling state, results, and type-safe error handling.",
        language: "kotlin",
        code: `// Sealed class for API result
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val message: String, val code: Int) : Result<Nothing>()
    object Loading : Result<Nothing>()
}

// Usage with when expression (exhaustive)
fun handleResult(result: Result<User>) {
    when (result) {
        is Result.Success -> println("User: \${result.data}")
        is Result.Error -> println("Error: \${result.message}")
        Result.Loading -> println("Loading...")
    }
    // No else needed - compiler ensures all cases covered
}

// Sealed class for state management
sealed class UIState {
    object Idle : UIState()
    object Loading : UIState()
    data class Content(val items: List<String>) : UIState()
    data class Error(val message: String) : UIState()
}

// Sealed class for navigation
sealed class Screen {
    object Home : Screen()
    data class Profile(val userId: Int) : Screen()
    data class Settings(val section: String) : Screen()
}

// Generic sealed class
sealed class Optional<out T> {
    data class Some<T>(val value: T) : Optional<T>()
    object None : Optional<Nothing>()

    fun <R> map(transform: (T) -> R): Optional<R> = when (this) {
        is Some -> Some(transform(value))
        None -> None
    }
}`,
      },
    ],
  },
  {
    id: "mise",
    name: "Mise",
    description: "Mise dev tools version manager patterns and workflows",
    patterns: [
      // Mise Basics
      {
        id: "mise-install",
        title: "Install and Setup Mise",
        category: "Getting Started",
        description: "Install mise and basic configuration",
        usage: "Initial setup for mise to manage your development tool versions. Works across multiple projects and shell sessions.",
        language: "bash",
        code: `# Install mise (multiple methods)

# Using curl
curl https://mise.run | sh

# Using Homebrew (macOS/Linux)
brew install mise

# Using cargo (Rust)
cargo install mise

# Activate mise in your shell
# Add to ~/.bashrc or ~/.zshrc
echo 'eval "$(mise activate bash)"' >> ~/.bashrc  # for bash
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc   # for zsh

# Reload shell
source ~/.bashrc  # or source ~/.zshrc

# Verify installation
mise --version

# Enable mise for current shell session
eval "$(mise activate bash)"  # or zsh

# View available plugins
mise plugins ls-remote

# Install a plugin
mise plugins install node
mise plugins install ruby`,
      },
      {
        id: "mise-basic-usage",
        title: "Basic Mise Commands",
        category: "Core Commands",
        description: "Essential mise commands for daily use",
        usage: "Common commands for managing tool versions with mise. Use these to install, activate, and switch between versions.",
        language: "bash",
        code: `# Install a specific version
mise install node@20.11.0
mise install ruby@3.3.0
mise install java@21

# Install latest version
mise install node@latest
mise install ruby@latest

# List installed versions
mise list

# List all available versions for a tool
mise list-remote node
mise list-remote ruby

# Set global version (in ~/.config/mise/config.toml)
mise use --global node@20.11.0
mise use --global ruby@3.3.0

# Set local version (in .mise.toml or .tool-versions)
mise use node@20.11.0
mise use ruby@3.3.0
mise use java@21

# Set version for current shell only
mise shell node@18.0.0

# Uninstall a version
mise uninstall node@18.0.0

# Update mise itself
mise self-update

# Show current versions
mise current

# Show where tools are installed
mise where node
mise where ruby`,
      },
      {
        id: "mise-tool-versions",
        title: ".tool-versions File",
        category: "Configuration",
        description: "Configure project versions with .tool-versions",
        usage: "Use .tool-versions for asdf compatibility. This file defines tool versions at the project level.",
        language: "bash",
        code: `# .tool-versions file (in project root)
# Compatible with asdf

nodejs 20.11.0
ruby 3.3.0
java openjdk-21
python 3.12.1
postgres 16.1

# Comments are supported
# mise will auto-install these versions when you cd into the directory`,
      },
      {
        id: "mise-config-toml",
        title: "mise.toml Configuration",
        category: "Configuration",
        description: "Advanced mise configuration with TOML",
        usage: "mise.toml provides more features than .tool-versions including environment variables, tasks, and tool-specific settings.",
        language: "yaml",
        code: `# .mise.toml (in project root)
# More powerful than .tool-versions

[tools]
node = "20.11.0"
ruby = "3.3.0"
java = "openjdk-21"
python = "3.12.1"

# Or use latest versions
# node = "latest"

# Environment variables
[env]
DATABASE_URL = "postgresql://localhost/myapp_dev"
RAILS_ENV = "development"
NODE_ENV = "development"

# Path additions
[env]
_.path = ["./bin", "./node_modules/.bin"]

# Tasks (like package.json scripts)
[tasks.dev]
run = "rails server"

[tasks.test]
run = "bundle exec rspec"

[tasks.lint]
run = "rubocop"

# Tool-specific options
[tools.node]
# Use specific version for this project
version = "20.11.0"

[tools.ruby]
# Install with specific options
install_opts = "--with-openssl-dir=/opt/homebrew/opt/openssl@3"`,
      },
      {
        id: "mise-global-config",
        title: "Global mise Configuration",
        category: "Configuration",
        description: "Set global defaults in config.toml",
        usage: "Global configuration affects all projects. Store default versions and global settings here.",
        language: "yaml",
        code: `# ~/.config/mise/config.toml
# Global configuration for mise

[tools]
# Default versions for all projects
node = "20.11.0"
ruby = "3.3.0"
java = "openjdk-21"
python = "3.12.1"

# Global environment variables
[env]
EDITOR = "code"
VISUAL = "code"

# Settings
[settings]
# Auto-install missing tools when entering directory
auto_install = true

# Verbose output
verbose = false

# Always use latest patch version
always_keep_download = false

# Parallelism for downloads
jobs = 4

# Plugins
[plugins]
# Custom plugin sources
# node = "https://github.com/mise-plugins/mise-node.git"`,
      },
      {
        id: "mise-multi-version",
        title: "Multiple Versions Workflow",
        category: "Workflows",
        description: "Work with multiple versions across projects",
        usage: "Mise automatically switches versions when you change directories. This workflow shows how to manage multiple projects with different versions.",
        language: "bash",
        code: `# Project A - Node 18 and Ruby 3.2
cd ~/projects/project-a
cat .tool-versions
# nodejs 18.19.0
# ruby 3.2.0

node --version  # v18.19.0
ruby --version  # ruby 3.2.0

# Project B - Node 20 and Ruby 3.3
cd ~/projects/project-b
cat .tool-versions
# nodejs 20.11.0
# ruby 3.3.0

node --version  # v20.11.0
ruby --version  # ruby 3.3.0

# Versions switch automatically when changing directories!

# Check which version is active
mise current

# See all installed versions
mise list

# See which version will be used (respects hierarchy)
mise which node
mise which ruby

# Version resolution order:
# 1. Shell version (mise shell)
# 2. Local .mise.toml or .tool-versions
# 3. Parent directory configs (searches up)
# 4. Global ~/.config/mise/config.toml`,
      },
      {
        id: "mise-env-vars",
        title: "Environment Variables",
        category: "Workflows",
        description: "Manage environment variables with mise",
        usage: "Mise can manage environment variables per project, replacing .env files. Variables are automatically loaded when entering the directory.",
        language: "yaml",
        code: `# .mise.toml
[tools]
node = "20.11.0"
ruby = "3.3.0"

# Environment variables
[env]
DATABASE_URL = "postgresql://localhost/myapp_dev"
REDIS_URL = "redis://localhost:6379"
API_KEY = "dev_key_12345"
NODE_ENV = "development"
RAILS_ENV = "development"

# Add directories to PATH
_.path = [
    "./bin",
    "./node_modules/.bin",
    "~/.local/bin"
]

# Source from file
_.file = ".env.local"

# Use templates
[env]
PROJECT_ROOT = "{{config_root}}"
LOG_FILE = "{{config_root}}/logs/app.log"

# Conditional based on OS
[env._.windows]
EDITOR = "notepad"

[env._.unix]
EDITOR = "vim"`,
      },
      {
        id: "mise-tasks",
        title: "Mise Tasks (Scripts)",
        category: "Workflows",
        description: "Define project tasks in mise.toml",
        usage: "Tasks are like package.json scripts but for any project type. Run common development commands with 'mise run'.",
        language: "yaml",
        code: `# .mise.toml
[tasks.dev]
description = "Start development server"
run = "rails server -p 3000"

[tasks.test]
description = "Run all tests"
run = "bundle exec rspec"

[tasks.lint]
description = "Run linter"
run = "rubocop --autocorrect"

[tasks.db-reset]
description = "Reset database"
run = "rails db:drop db:create db:migrate db:seed"

[tasks.install]
description = "Install dependencies"
run = "bundle install && npm install"

# Task with multiple commands
[tasks.setup]
description = "Setup project"
run = """
bundle install
npm install
rails db:setup
rails db:migrate
"""

# Task dependencies
[tasks.deploy]
description = "Deploy application"
depends = ["test", "lint"]
run = "git push heroku main"

# Run tasks with:
# mise run dev
# mise run test
# mise run lint

# List all tasks
# mise tasks`,
      },
      {
        id: "mise-vs-others",
        title: "Mise vs Other Version Managers",
        category: "Reference",
        description: "Command comparison across version managers",
        usage: "Quick reference for developers switching from other version managers to mise.",
        language: "bash",
        code: `# Installing a version
# nvm
nvm install 20.11.0
# rbenv
rbenv install 3.3.0
# mise
mise install node@20.11.0
mise install ruby@3.3.0

# Setting global version
# nvm
nvm alias default 20.11.0
# rbenv
rbenv global 3.3.0
# mise
mise use --global node@20.11.0
mise use --global ruby@3.3.0

# Setting local version
# nvm
echo "20.11.0" > .nvmrc
# rbenv
rbenv local 3.3.0
# mise
mise use node@20.11.0
mise use ruby@3.3.0

# List installed versions
# nvm
nvm list
# rbenv
rbenv versions
# mise
mise list

# Show current version
# nvm
nvm current
# rbenv
rbenv version
# mise
mise current

# Advantages of mise:
# - Single tool for ALL languages (node, ruby, python, java, etc.)
# - Auto-switches versions based on directory
# - Environment variable management
# - Task runner built-in
# - Compatible with .tool-versions (asdf)
# - Faster than asdf (written in Rust)`,
      },
      {
        id: "mise-tips",
        title: "Mise Pro Tips",
        category: "Reference",
        description: "Advanced tips and tricks for mise",
        usage: "Productivity tips for power users. These patterns help you work more efficiently with mise.",
        language: "bash",
        code: `# Auto-install tools when entering directory
# Add to ~/.config/mise/config.toml
[settings]
auto_install = true

# Now mise auto-installs missing versions!

# Update all tools to latest
mise upgrade

# Update specific tool
mise upgrade node

# Install all tools from .tool-versions
mise install

# Prune old versions
mise prune

# See effective configuration
mise config

# Doctor - check for issues
mise doctor

# Cache management
mise cache clear

# Watch for config changes and auto-reload
mise watch

# Use mise with direnv for advanced env management
# Install direnv, then in .envrc:
use mise

# Benchmark tool installation
mise install node@20.11.0 --verbose

# Use plugin options
mise install ruby@3.3.0 --with-openssl-dir=/usr/local/opt/openssl

# Link to system version (skip installation)
mise link node@system /usr/local/bin/node

# Create alias for version
mise alias set node lts 20.11.0
mise install node@lts

# Trust specific config
mise trust .mise.toml

# Export current versions to .tool-versions
mise ls --current > .tool-versions

# Integration with CI/CD
# Most CI systems can install mise:
curl https://mise.run | sh
mise install
mise exec -- npm test`,
      },
    ],
  },
];

export function TechStackReference() {
  const [selectedStack, setSelectedStack] = useState<TechStack>(techStacks[0]);
  const [selectedPattern, setSelectedPattern] = useState<Pattern>(
    techStacks[0].patterns[0]
  );

  const categories = Array.from(
    new Set(selectedStack.patterns.map((p) => p.category))
  );

  const handleStackChange = (stack: TechStack) => {
    setSelectedStack(stack);
    setSelectedPattern(stack.patterns[0]);
  };

  return (
    <div className="space-y-6">
      {/* Tech Stack Selector */}
      <Card className="p-4 bg-card border-border">
        <p className="text-sm font-medium text-foreground mb-3">
          Select Tech Stack
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {techStacks.map((stack) => (
            <button
              key={stack.id}
              onClick={() => handleStackChange(stack)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                selectedStack.id === stack.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
            >
              <div className="font-semibold">{stack.name}</div>
              <div className="text-xs opacity-80 mt-1">
                {stack.description}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-4">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 mr-4">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {selectedPattern.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedPattern.description}
                </p>
                <p className="text-sm text-foreground/80 italic">
                  💡 {selectedPattern.usage}
                </p>
              </div>
              <CopyButton textToCopy={selectedPattern.code} />
            </div>
            <div className="relative">
              <SyntaxHighlighter
                language={selectedPattern.language}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  lineHeight: "1.5",
                }}
                showLineNumbers
              >
                {selectedPattern.code}
              </SyntaxHighlighter>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 bg-card border-border">
            <p className="text-sm font-medium text-foreground mb-4">
              Pattern Library
            </p>
            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
              {categories.map((category) => (
                <div key={category}>
                  <p className="font-medium mb-2 text-foreground text-sm">
                    {category}
                  </p>
                  <div className="space-y-1">
                    {selectedStack.patterns
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
    </div>
  );
}
