#!/bin/bash

# deploy.sh - NativePHP Android Deployment Script
# This script handles the complete build and deployment process for NativePHP Android apps

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to prompt for user input with default value
prompt_with_default() {
    local prompt_text="$1"
    local default_value="$2"
    local input

    if [[ -n "$default_value" ]]; then
        read -p "$prompt_text [$default_value]: " input
        echo "${input:-$default_value}"
    else
        read -p "$prompt_text: " input
        echo "$input"
    fi
}

# Function to prompt for password (hidden input)
prompt_password() {
    local prompt_text="$1"
    local input
    read -s -p "$prompt_text: " input
    echo
    echo "$input"
}

# Function to prompt for password with confirmation on separate lines
prompt_password_with_confirmation() {
    local prompt_text="$1"
    local password
    local confirm_password

    echo
    while true; do
        password=$(prompt_password "$prompt_text")
        echo
        confirm_password=$(prompt_password "Confirm $prompt_text")
        echo

        if [[ "$password" == "$confirm_password" ]]; then
            # Remove any whitespace or newlines
            password=$(echo "$password" | tr -d '\n\r' | xargs)

            # Check if password contains only ASCII characters
            if [[ "$password" =~ [^[:ascii:]] ]]; then
                print_error "Password contains non-ASCII characters. Please use only ASCII characters (letters, numbers, and symbols like !@#$%^&*)."
                print_info "This is required for Java keystore compatibility."
                continue
            fi
            echo "$password"
            return 0
        else
            print_error "Passwords do not match. Please try again."
        fi
    done
}

# Function to validate password is ASCII
validate_ascii_password() {
    local password="$1"
    # Remove any whitespace or newlines first
    password=$(echo "$password" | tr -d '\n\r' | xargs)
    if [[ "$password" =~ [^[:ascii:]] ]]; then
        return 1
    fi
    return 0
}

# Function to clean password (remove whitespace and newlines)
clean_password() {
    local password="$1"
    echo "$password" | tr -d '\n\r' | xargs
}

# Function to get Android credentials using expect
get_android_credentials_with_expect() {
    if ! command_exists expect; then
        print_warning "expect not found. Falling back to manual mode."
        return 1
    fi

    print_info "Running php artisan native:credentials android with expect..."

    # Create a temporary expect script
    local expect_script=$(mktemp)

    cat > "$expect_script" << 'EOF'
#!/usr/bin/expect -f
set timeout 30
log_user 1

spawn php artisan native:credentials android

expect {
    timeout {
        puts "Timeout waiting for input"
        exit 1
    }
    "Keystore filename" {
        send_user "\n[INFO] Please enter keystore filename\n"
        expect_user -re "(.*)\n" {
            set keystore_filename $expect_out(1,string)
            send "$keystore_filename\r"
        }
        exp_continue
    }
    "Keystore password" {
        send_user "\n[INFO] Please enter keystore password (ASCII characters only)\n"
        stty -echo
        expect_user -re "(.*)\n" {
            set keystore_password $expect_out(1,string)
            send "$keystore_password\r"
        }
        stty echo
        exp_continue
    }
    "Confirm keystore password" {
        send_user "\n[INFO] Please confirm keystore password\n"
        stty -echo
        expect_user -re "(.*)\n" {
            set confirm_password $expect_out(1,string)
            send "$confirm_password\r"
        }
        stty echo
        exp_continue
    }
    "Key alias" {
        send_user "\n[INFO] Please enter key alias\n"
        expect_user -re "(.*)\n" {
            set key_alias $expect_out(1,string)
            send "$key_alias\r"
        }
        exp_continue
    }
    "Key password" {
        send_user "\n[INFO] Please enter key password (ASCII characters only)\n"
        stty -echo
        expect_user -re "(.*)\n" {
            set key_password $expect_out(1,string)
            send "$key_password\r"
        }
        stty echo
        exp_continue
    }
    "Confirm key password" {
        send_user "\n[INFO] Please confirm key password\n"
        stty -echo
        expect_user -re "(.*)\n" {
            set confirm_key_password $expect_out(1,string)
            send "$confirm_key_password\r"
        }
        stty echo
        exp_continue
    }
    eof {
        puts "\n[INFO] Command completed"
    }
}

# Save to file for later retrieval
puts "KEYSTORE_FILENAME=$keystore_filename"
puts "KEYSTORE_PASSWORD=$keystore_password"
puts "KEY_ALIAS=$key_alias"
puts "KEY_PASSWORD=$key_password"
EOF

    chmod +x "$expect_script"

    # Run the expect script and capture output
    local output
    output=$("$expect_script" 2>&1)
    local exit_code=$?

    # Clean up
    rm -f "$expect_script"

    if [[ $exit_code -ne 0 ]]; then
        print_error "Failed to get credentials from artisan command"
        return 1
    fi

    # Extract values from output - fixed sed formatting
    local keystore_filename=$(echo "$output" | grep "KEYSTORE_FILENAME=" | sed -E 's/KEYSTORE_FILENAME=//' | tr -d '\r' | tail -1 | xargs)
    KEYSTORE_PASSWORD=$(echo "$output" | grep "KEYSTORE_PASSWORD=" | sed -E 's/KEYSTORE_PASSWORD=//' | tr -d '\r' | tail -1 | xargs)
    KEY_ALIAS=$(echo "$output" | grep "KEY_ALIAS=" | sed -E 's/KEY_ALIAS=//' | tr -d '\r' | tail -1 | xargs)
    KEY_PASSWORD=$(echo "$output" | grep "KEY_PASSWORD=" | sed -E 's/KEY_PASSWORD=//' | tr -d '\r' | tail -1 | xargs)

    # Clean passwords (remove whitespace and newlines)
    KEYSTORE_PASSWORD=$(clean_password "$KEYSTORE_PASSWORD")
    KEY_PASSWORD=$(clean_password "$KEY_PASSWORD")

    # Validate passwords are ASCII
    if ! validate_ascii_password "$KEYSTORE_PASSWORD"; then
        print_error "Keystore password contains non-ASCII characters"
        print_info "Please use only ASCII characters (letters, numbers, and symbols like !@#$%^&*)"
        return 1
    fi

    if ! validate_ascii_password "$KEY_PASSWORD"; then
        print_error "Key password contains non-ASCII characters"
        print_info "Please use only ASCII characters (letters, numbers, and symbols like !@#$%^&*)"
        return 1
    fi

    # Ensure keystore filename has .jks extension
    if [[ -n "$keystore_filename" ]]; then
        if [[ ! "$keystore_filename" =~ \.jks$ ]]; then
            keystore_filename="${keystore_filename}.jks"
        fi
        KEYSTORE_PATH="$(pwd)/credentials/$keystore_filename"
    else
        KEYSTORE_PATH="$(pwd)/credentials/app-release-key.jks"
    fi

    # Export as environment variables
    export KEYSTORE_PATH
    export KEYSTORE_PASSWORD
    export KEY_ALIAS
    export KEY_PASSWORD

    print_success "Credentials retrieved successfully"
    print_info "Keystore path: $KEYSTORE_PATH"
    print_info "Key alias: $KEY_ALIAS"

    return 0
}

# Manual credential input function
get_android_credentials_manual() {
    echo
    print_info "Please enter your Android signing credentials manually:"
    echo
    print_warning "IMPORTANT: Passwords must use only ASCII characters (letters, numbers, and symbols like !@#$%^&*)"
    echo "            Non-ASCII characters (like emojis or special Unicode) are not supported by Java keystore."
    echo

    # Create credentials directory if it doesn't exist
    mkdir -p credentials

    # Keystore filename
    local default_keystore="app-release-key.jks"
    local keystore_filename=$(prompt_with_default "Enter keystore filename" "$default_keystore")

    # Ensure .jks extension
    if [[ ! "$keystore_filename" =~ \.jks$ ]]; then
        keystore_filename="${keystore_filename}.jks"
    fi

    KEYSTORE_PATH="$(pwd)/credentials/$keystore_filename"

    # Keystore password
    echo
    KEYSTORE_PASSWORD=$(prompt_password_with_confirmation "Enter keystore password (ASCII only)")

    # Key alias
    echo
    KEY_ALIAS=$(prompt_with_default "Enter key alias" "my-app-key")

    # Key password
    echo
    KEY_PASSWORD=$(prompt_password_with_confirmation "Enter key password (ASCII only)")

    # Export as environment variables
    export KEYSTORE_PATH
    export KEYSTORE_PASSWORD
    export KEY_ALIAS
    export KEY_PASSWORD

    print_success "Credentials collected successfully"
}

# Function to get Android credentials
get_android_credentials() {
    # Check if credentials exist in environment variables
    if [[ -n "$ANDROID_KEYSTORE_PATH" && -n "$ANDROID_KEYSTORE_PASSWORD" && -n "$ANDROID_KEY_ALIAS" && -n "$ANDROID_KEY_PASSWORD" ]]; then
        print_info "Using credentials from environment variables"
        # Clean passwords
        ANDROID_KEYSTORE_PASSWORD=$(clean_password "$ANDROID_KEYSTORE_PASSWORD")
        ANDROID_KEY_PASSWORD=$(clean_password "$ANDROID_KEY_PASSWORD")

        # Validate passwords are ASCII
        if ! validate_ascii_password "$ANDROID_KEYSTORE_PASSWORD"; then
            print_error "Environment variable ANDROID_KEYSTORE_PASSWORD contains non-ASCII characters"
            print_info "Please use only ASCII characters"
            exit 1
        fi
        if ! validate_ascii_password "$ANDROID_KEY_PASSWORD"; then
            print_error "Environment variable ANDROID_KEY_PASSWORD contains non-ASCII characters"
            print_info "Please use only ASCII characters"
            exit 1
        fi
        KEYSTORE_PATH="$ANDROID_KEYSTORE_PATH"
        KEYSTORE_PASSWORD="$ANDROID_KEYSTORE_PASSWORD"
        KEY_ALIAS="$ANDROID_KEY_ALIAS"
        KEY_PASSWORD="$ANDROID_KEY_PASSWORD"
        export KEYSTORE_PATH KEYSTORE_PASSWORD KEY_ALIAS KEY_PASSWORD
        return
    fi

    # Check if credentials exist in .env file
    if [[ -f ".env" ]]; then
        print_info "Checking .env for Android credentials..."
        # Extract values from .env - fixed sed formatting
        local env_keystore_path=$(grep "^ANDROID_KEYSTORE_PATH=" .env | sed -E 's/^ANDROID_KEYSTORE_PATH=//' | tr -d '"' | tr -d "'" | xargs)
        local env_keystore_password=$(grep "^ANDROID_KEYSTORE_PASSWORD=" .env | sed -E 's/^ANDROID_KEYSTORE_PASSWORD=//' | tr -d '"' | tr -d "'" | xargs)
        local env_key_alias=$(grep "^ANDROID_KEY_ALIAS=" .env | sed -E 's/^ANDROID_KEY_ALIAS=//' | tr -d '"' | tr -d "'" | xargs)
        local env_key_password=$(grep "^ANDROID_KEY_PASSWORD=" .env | sed -E 's/^ANDROID_KEY_PASSWORD=//' | tr -d '"' | tr -d "'" | xargs)

        # Clean passwords
        env_keystore_password=$(clean_password "$env_keystore_password")
        env_key_password=$(clean_password "$env_key_password")

        if [[ -n "$env_keystore_path" && -n "$env_keystore_password" && -n "$env_key_alias" && -n "$env_key_password" ]]; then
            # Validate passwords are ASCII
            if ! validate_ascii_password "$env_keystore_password"; then
                print_error ".env contains non-ASCII characters in ANDROID_KEYSTORE_PASSWORD"
                print_info "Please use only ASCII characters"
                exit 1
            fi
            if ! validate_ascii_password "$env_key_password"; then
                print_error ".env contains non-ASCII characters in ANDROID_KEY_PASSWORD"
                print_info "Please use only ASCII characters"
                exit 1
            fi
            KEYSTORE_PATH="$env_keystore_path"
            KEYSTORE_PASSWORD="$env_keystore_password"
            KEY_ALIAS="$env_key_alias"
            KEY_PASSWORD="$env_key_password"
            export KEYSTORE_PATH KEYSTORE_PASSWORD KEY_ALIAS KEY_PASSWORD
            print_success "Credentials loaded from .env"
            return
        fi
    fi

    # Check if keystore exists in credentials directory
    if [[ -f "credentials/app-release-key.jks" ]]; then
        print_info "Found existing keystore: credentials/app-release-key.jks"
        KEYSTORE_PATH="$(pwd)/credentials/app-release-key.jks"

        # Try to get password from user
        local max_attempts=3
        local attempt=1
        local verified=false

        while [[ $attempt -le $max_attempts && $verified == false ]]; do
            echo
            print_info "Attempt $attempt of $max_attempts"
            KEYSTORE_PASSWORD=$(prompt_password "Enter keystore password (ASCII only)")
            echo

            # Clean password
            KEYSTORE_PASSWORD=$(clean_password "$KEYSTORE_PASSWORD")

            if keytool -list -keystore "$KEYSTORE_PATH" -storepass "$KEYSTORE_PASSWORD" > /dev/null 2>&1; then
                verified=true
                print_success "Keystore verified successfully!"

                # Get alias from keystore
                KEY_ALIAS=$(keytool -list -keystore "$KEYSTORE_PATH" -storepass "$KEYSTORE_PASSWORD" | grep -E "Entry|alias" | head -1 | sed -E 's/.*, //' | sed -E 's/Entry//g' | xargs)
                if [[ -z "$KEY_ALIAS" ]]; then
                    KEY_ALIAS=$(prompt_with_default "Enter key alias" "my-app-key")
                fi

                KEY_PASSWORD=$(prompt_password "Enter key password (ASCII only)")
                echo
                KEY_PASSWORD=$(clean_password "$KEY_PASSWORD")
                if [[ -z "$KEY_PASSWORD" ]]; then
                    KEY_PASSWORD="$KEYSTORE_PASSWORD"
                fi

                # Validate passwords are ASCII
                if ! validate_ascii_password "$KEYSTORE_PASSWORD"; then
                    print_error "Keystore password contains non-ASCII characters"
                    print_info "Please use only ASCII characters"
                    exit 1
                fi
                if ! validate_ascii_password "$KEY_PASSWORD"; then
                    print_error "Key password contains non-ASCII characters"
                    print_info "Please use only ASCII characters"
                    exit 1
                fi

                export KEYSTORE_PATH KEYSTORE_PASSWORD KEY_ALIAS KEY_PASSWORD
                print_success "Credentials retrieved from existing keystore"
                return
            else
                print_error "Invalid keystore password"
                ((attempt++))
            fi
        done

        if [[ $verified == false ]]; then
            print_warning "Failed to verify keystore"
            read -p "Do you want to use the artisan command instead? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                # Try artisan command
                if get_android_credentials_with_expect; then
                    return
                fi
            fi
        fi
    fi

    # Try artisan command with expect
    print_info "Attempting to get credentials from artisan command..."
    if get_android_credentials_with_expect; then
        return
    fi

    # Fallback to manual input
    print_warning "Falling back to manual credential input..."
    get_android_credentials_manual
}

# Function to generate keystore if needed
generate_keystore_if_needed() {
    local keystore_path="$1"
    local keystore_password="$2"
    local key_alias="$3"
    local key_password="$4"

    # Clean passwords
    keystore_password=$(clean_password "$keystore_password")
    key_password=$(clean_password "$key_password")

    # Create credentials directory if it doesn't exist
    mkdir -p credentials

    if [[ -f "$keystore_path" ]]; then
        print_success "Keystore found at: $keystore_path"
        return 0
    fi

    print_warning "Keystore not found at: $keystore_path"
    read -p "Do you want to generate a new keystore? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Keystore generation cancelled"
        exit 1
    fi

    # Get organization details
    echo
    print_info "Enter organization details (press Enter for defaults):"
    local cn=$(prompt_with_default "Common Name (CN)" "MyApp")
    local ou=$(prompt_with_default "Organizational Unit (OU)" "Development")
    local o=$(prompt_with_default "Organization (O)" "MyCompany")
    local l=$(prompt_with_default "Locality/City (L)" "City")
    local st=$(prompt_with_default "State/Province (ST)" "State")
    local c=$(prompt_with_default "Country Code (C)" "US")

    local distinguished_names="CN=$cn, OU=$ou, O=$o, L=$l, ST=$st, C=$c"

    echo
    print_info "Generating keystore with: $distinguished_names"
    echo
    print_warning "IMPORTANT: Using JKS format (not PKCS12) to avoid password encoding issues"

    # Generate keystore in JKS format
    keytool -genkey -v -keystore "$keystore_path" \
        -alias "$key_alias" \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -storepass "$keystore_password" \
        -keypass "$key_password" \
        -dname "$distinguished_names" \
        -storetype JKS

    if [[ $? -eq 0 ]]; then
        print_success "Keystore generated successfully at: $keystore_path"
        print_warning "⚠️  IMPORTANT: Please backup this keystore file!"
        print_warning "⚠️  Keystore location: $keystore_path"
        print_warning "⚠️  Keystore password: (the one you provided)"
        print_warning "⚠️  Key alias: $key_alias"
        print_warning "⚠️  Key password: (the one you provided)"
        return 0
    else
        print_error "Failed to generate keystore"
        return 1
    fi
}

# Save credentials to .env
save_credentials_to_env() {
    if [[ -n "$KEYSTORE_PATH" && -n "$KEYSTORE_PASSWORD" && -n "$KEY_ALIAS" && -n "$KEY_PASSWORD" ]]; then
        # Clean passwords
        local clean_keystore_password=$(clean_password "$KEYSTORE_PASSWORD")
        local clean_key_password=$(clean_password "$KEY_PASSWORD")

        # Check if .env exists, if not create it
        if [[ ! -f ".env" ]]; then
            touch .env
            print_info "Created .env file"
        fi

        # Remove existing Android credentials from .env
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' '/^ANDROID_KEYSTORE_PATH=/d' .env 2>/dev/null || true
            sed -i '' '/^ANDROID_KEYSTORE_PASSWORD=/d' .env 2>/dev/null || true
            sed -i '' '/^ANDROID_KEY_ALIAS=/d' .env 2>/dev/null || true
            sed -i '' '/^ANDROID_KEY_PASSWORD=/d' .env 2>/dev/null || true
        else
            # Linux
            sed -i '/^ANDROID_KEYSTORE_PATH=/d' .env 2>/dev/null || true
            sed -i '/^ANDROID_KEYSTORE_PASSWORD=/d' .env 2>/dev/null || true
            sed -i '/^ANDROID_KEY_ALIAS=/d' .env 2>/dev/null || true
            sed -i '/^ANDROID_KEY_PASSWORD=/d' .env 2>/dev/null || true
        fi

        # Add new credentials to .env
        echo "" >> .env
        echo "# Android Signing Credentials" >> .env
        echo "ANDROID_KEYSTORE_PATH=$KEYSTORE_PATH" >> .env
        echo "ANDROID_KEYSTORE_PASSWORD=$clean_keystore_password" >> .env
        echo "ANDROID_KEY_ALIAS=$KEY_ALIAS" >> .env
        echo "ANDROID_KEY_PASSWORD=$clean_key_password" >> .env

        print_success "Credentials saved to .env"
        print_warning "⚠️  Keep this file secure and don't commit it to version control!"

        # Add to .gitignore if not already there
        if [[ -f ".gitignore" ]] && ! grep -q ".env" .gitignore; then
            echo ".env" >> .gitignore
            print_info "Added .env to .gitignore"
        fi
    fi
}

# Main deployment function
deploy_app() {
    print_info "Starting NativePHP Android deployment..."
    echo

    # Check prerequisites
    print_info "Checking prerequisites..."
    if ! command_exists php; then
        print_error "PHP is not installed"
        exit 1
    fi
    if ! command_exists keytool; then
        print_error "keytool (Java JDK) is not installed"
        print_info "Install Java JDK and try again"
        exit 1
    fi
    print_success "Prerequisites check passed"
    echo

    # Get credentials
    get_android_credentials
    echo

    # Verify and generate keystore if needed
    generate_keystore_if_needed "$KEYSTORE_PATH" "$KEYSTORE_PASSWORD" "$KEY_ALIAS" "$KEY_PASSWORD"
    echo

    # Save credentials to .env
    save_credentials_to_env
    echo

    # Run release
    print_info "Running release..."
    php artisan native:release patch
    print_success "Release completed"
    echo

    # Package app
    print_info "Packaging app..."
    local package_cmd="php artisan native:run --build=release"
    echo -e "${YELLOW}Executing:${NC} $package_cmd"
    echo
    eval "$package_cmd"

    if [[ $? -eq 0 ]]; then
        print_success "App packaged successfully!"
    else
        print_error "Package command failed"
        exit 1
    fi
    echo

    # Find APK
    print_info "Looking for APK..."
    local apk_dirs=(
        "nativephp/android/app/build/outputs/apk/release"
        "native/dist"
        "android/app/build/outputs/apk/release"
        "app/build/outputs/apk/release"
        "android/app/build/outputs/apk/debug"
    )

    local found=false
    for apk_dir in "${apk_dirs[@]}"; do
        if [[ -d "$apk_dir" ]]; then
            local apk_files=("$apk_dir"/*.apk)
            if [[ ${#apk_files[@]} -gt 0 ]]; then
                print_success "APK files found in $apk_dir:"
                for apk in "${apk_files[@]}"; do
                    local apk_size=$(du -h "$apk" | cut -f1)
                    echo "  ✓ $(basename "$apk") ($apk_size)"
                done
                found=true
            fi
        fi
    done

    if [[ "$found" == false ]]; then
        print_warning "No APK files found in common locations"
    fi
    echo

    print_success "🎉 Deployment completed successfully!"
    echo
    print_info "📋 Next steps:"
    echo "  1. Test the APK on a device or emulator"
    echo "  2. Sign the APK for production release"
    echo "  3. Upload to Google Play Store if ready"
}

# Show help
show_help() {
    cat << EOF
NativePHP Android Deployment Script

Usage:
  ./deploy.sh [options]

Options:
  -h, --help     Show this help
  -y, --yes      Skip confirmation prompts
  -v, --verbose  Show detailed output

IMPORTANT:
  - Passwords must use ONLY ASCII characters (letters, numbers, and symbols like !@#$%^&*)
  - Non-ASCII characters (emojis, special Unicode, etc.) are NOT supported by Java keystore
  - Credentials are stored in the 'credentials' directory
  - Credentials are saved to .env file
  - Keystore files automatically get .jks extension

Examples:
  ./deploy.sh              # Run with interactive prompts
  ./deploy.sh --yes        # Run without confirmations

Environment variables (optional):
  ANDROID_KEYSTORE_PATH
  ANDROID_KEYSTORE_PASSWORD (ASCII only)
  ANDROID_KEY_ALIAS
  ANDROID_KEY_PASSWORD (ASCII only)

Or add these variables to your .env file.
EOF
}

# Parse arguments
SKIP_CONFIRMATION=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help) show_help; exit 0 ;;
        -y|--yes) SKIP_CONFIRMATION=true; shift ;;
        -v|--verbose) VERBOSE=true; shift ;;
        *) print_error "Unknown option: $1"; show_help; exit 1 ;;
    esac
done

# Main execution
echo "========================================="
echo "  NativePHP Android Deployment Script"
echo "========================================="
echo

if [[ "$SKIP_CONFIRMATION" == false ]]; then
    read -p "Proceed with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Deployment cancelled"
        exit 0
    fi
    echo
fi

# Run the deployment
deploy_app

if [[ "$VERBOSE" == true ]]; then
    echo
    print_info "System information:"
    echo "  PHP version: $(php -v | head -n1)"
    echo "  Java version: $(java -version 2>&1 | head -n1)"
    echo "  Current directory: $(pwd)"
    echo "  User: $(whoami)"
    echo "  Date: $(date)"
fi

echo
print_success "✨ Script execution completed!"

