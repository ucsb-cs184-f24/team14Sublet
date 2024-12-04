# Video of Test Run

[![Video](https://img.youtube.com/vi/it34yJEnC8E/0.jpg)](https://youtu.be/it34yJEnC8E)

# Instructions for Running the E2E Testing Script with Maestro

## Prerequisites

1. **Install Maestro**

   - Download and install Maestro by following the [official installation guide](https://maestro.mobile.dev/getting-started/installing-maestro).
   - Ensure Maestro is properly added to your system's PATH.

2. **Download the APK**

   - Obtain the **Homelette (v1.0.0)** APK file.
   - Save it to a known location, such as `~/Downloads/Homelette_v1.0.0.apk`.

3. **Prepare a Device**

   - Use a physical Android device or an emulator.
   - Enable **Developer Mode** and **USB Debugging** on your physical device.
   - Connect your device to your computer or start the emulator.

4. **Verify Maestro Setup**

   - Run the following command to ensure Maestro recognizes your device:
     ```bash
     maestro devices
     ```
   - Install the Homelette APK onto your device:
     ```bash
     maestro install ~/Downloads/Homelette_v1.0.0.apk
     ```

5. **Save the E2E Script**
   - Copy the provided YAML script into a file named `SignInRegActions.yaml`.
   - Save it in your project directory.

---

## Running the Script

1. Open a terminal and navigate to the directory where `SignInRegActions.yaml` is saved.

2. Execute the Maestro command to run the test:
   ```bash
   maestro test SignInRegActions.yaml
   ```
