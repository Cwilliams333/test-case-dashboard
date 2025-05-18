// Sample device configurations for demonstration
export const manufacturers = {
    "Samsung": [
      "Galaxy S24", 
      "Galaxy S24+", 
      "Galaxy S24 Ultra",
      "Galaxy S23",
      "Galaxy S23+",
      "Galaxy S23 Ultra",
      "Galaxy S22+"
    ],
    "Apple": [
      "iPhone 15", 
      "iPhone 15 Pro", 
      "iPhone 15 Pro Max", 
      "iPhone 16", 
      "iPhone 16 Pro"
    ],
    "Google": [
      "Pixel 8",
      "Pixel 8 Pro",
      "Pixel 9",
      "Pixel 9 Pro"
    ],
    "Motorola": [
      "Moto G Power 2022",
      "Moto G Stylus 5G (2022)",
      "Moto Edge"
    ]
  };
  
  // Sample configuration content for devices - mimics the INI files
  export const deviceConfigs = {
    "Galaxy S24 Ultra": `[General]
  Name = Galaxy S24 Ultra
  Version = 14
  
  [Dimensions]
  Dut_width = 79.0
  Dut_height = 162.3
  Width = 72.38
  Height = 156.82
  Offset_width = 3.31
  Offset_height = 2.74
  Thickness = 9.1
  
  [SIM]
  Type = DutSensor
  Data = {'id': 1}
  
  [PowerButton]
  Type = DutPhysicalButton
  Position = [75.428, 55.772, -3.968]
  Normal = [1.0, 0.0, 0.0]
  Data = {'button_type': 'Mechanical', 'backlight': 'False'}
  
  [VolumeDownButton]
  Type = DutPhysicalButton
  Position = [74.643, 39.726, -3.916]
  Normal = [1.0, 0.0, 0.0]
  Data = {'button_type': 'Mechanical', 'backlight': 'False'}
  
  [VolumeUpButton]
  Type = DutPhysicalButton
  Position = [74.643, 26.564, -4.052]
  Normal = [1.0, 0.0, 0.0]
  Data = {'button_type': 'Mechanical', 'backlight': 'False'}
  
  #[UsbCPort]
  #Type = DutPhysicalButton
  #Position = [35.999, 157.973, -3.199]
  #Normal = [0.0, 1.0, 0.0]
  #Data = {'reverse_tilt': 'False', 'audio': 'True', 'freqs_volume_level_pair_left': [[[1000.0], 16.5]], 'freqs_volume_level_pair_right': [[[2300.0], 16.0]], 'freqs_volume_level_rec_pair_0': [[[300.0, 500.0, 1050.0, 6000.0, 14000.0], 1855.0]], 'freqs_volume_level_rec_pair_1': [[[300.0, 500.0, 1050.0, 6000.0, 14000.0], 1857.5]]}
  
  [AmbientLightSensor]
  Type = DutSensor
  Position = [33.867, 4.811, 2.88]
  Normal = [0.0, 0.0, 1.0]
  
  [Bluetooth]
  Type = DutSensor
  Data = {'id': 1}
  
  [CameraTorch]
  Type = DutSensor
  Position = [41.672, 10.537, -10.649]
  Normal = [0.0, -1.0, 0.0]
  
  [MotionSensors]
  Type = DutSensor
  Data = {'accelerometer': 'True', 'gyroscope': 'True', 'magnetometer': 'True'}
  
  [PressureSensor]
  Type = DutSensor
  Data = {'id': 1}
  
  [VibrationEngine]
  Type = DutSensor
  Position = [10.867, 10.811, -1.259]
  Normal = [0.0, 0.0, 1.0]
  
  [ProximitySensor]
  Type = DutSensor
  Position = [35.316, -5.533, 5.866]
  Normal = [0.0, 0.0, 1.0]
  
  [Speaker1]
  Type = DutSensor
  Position = [26.798, -14.41, 5.904]
  Normal = [0.0, 0.0, 1.0]
  Data = {'id': 0, 'speaker_type': 'Receiver', 'volume': 0.9, 'freq_thd_pairs': [[1000, 0.007049638918934428], [1000, 0.0067107309688533194]], 'freqs_volume_level_pair': [[[1000], 170.5], [[1000], 167.5]], 'rotated': 'False'}
  
  [Speaker2]
  Type = DutSensor
  Position = [17.974, 152.326, 6.365]
  Normal = [0.0, 0.0, 1.0]
  Data = {'id': 3, 'speaker_type': 'Loudspeaker', 'volume': 0.9, 'freq_thd_pairs': [[1000, 0.036905578181825625], [1000, 0.03640912965729206]], 'freqs_volume_level_pair': [[[1000], 341.0], [[1000], 362.0]], 'rotated': 'False'}
  
  [Mic0]
  Type = DutSensor
  Data = {'id': 1, 'stereo': 'True', 'freqs_volume_level_pair_left': [[[1000], 8940.5]], 'freqs_volume_level_pair_right': [[[1000], 6002.0]]}
  
  [Mic1]
  Type = DutSensor
  Data = {'id': 5, 'stereo': 'True', 'freqs_volume_level_pair_left': [[[1000], 8474.5]], 'freqs_volume_level_pair_right': [[[1000], 5565.5]]}
  
  [Mic2]
  Type = DutSensor
  Data = {'id': 6, 'stereo': 'True', 'freqs_volume_level_pair_left': [[[1000], 3663.5]], 'freqs_volume_level_pair_right': [[[1000], 3663.5]]}
  
  [FrontCamera0]
  Type = DutSensor
  Position = [38.094, -2.389, 0.809]
  Normal = [0.0, -1.0, 0.0]
  Data = {'id': '1', 'camera_type': 'fixed', 'logical': 'False', 'focus_over_limits': 'True', 'focus_distance': '3.7373737373737375'}
  
  [FrontCamera1]
  Type = DutSensor
  Position = [38.094, -2.389, 0.809]
  Normal = [0.0, -1.0, 0.0]
  Data = {'id': '3', 'camera_type': 'auto', 'logical': 'False', 'focus_over_limits': 'True', 'focus_distance': '3.9393939393939394'}
  
  [BackCamera0]
  Type = DutSensor
  Position = [60.697, 25.9, -11.549]
  Normal = [0.0, -1.0, 0.0]
  Data = {'id': '0', 'camera_type': 'auto', 'logical': 'True', 'focus_over_limits': 'True', 'focus_distance': '4.329004242424242'}
  
  [BackCamera1]
  Type = DutSensor
  Position = [60.697, 6.608, -11.049]
  Normal = [0.0, -1.0, 0.0]
  Data = {'id': '2', 'camera_type': 'auto', 'logical': 'False', 'focus_over_limits': 'True', 'focus_distance': '6.666666666666667'}
  
  [Display]
  Type = DutSensor
  Data = {'display_type': 'LCD', 'edge_width': 0, 'exposure_time': 30380.0, 'white_balance': {'red': 1.309572745504433, 'green': 1.0, 'blue': 0.8742748513784966}}
  
  [Spen]
  Type = DutSensor
  Data = {'id': 1}`,
  
    "iPhone 15 Pro": `[General]
  Name = iPhone 15 Pro
  Version = 8
  
  [Dimensions]
  Dut_width = 71.4
  Dut_height = 146.7
  Width = 70.1
  Height = 146.0
  Offset_width = 0.65
  Offset_height = 0.35
  Thickness = 8.2
  
  [SIM]
  Type = DutSensor
  Data = {'id': 1}
  
  [PowerButton]
  Type = DutPhysicalButton
  Position = [68.748, 43.632, -3.968]
  Normal = [1.0, 0.0, 0.0]
  Data = {'button_type': 'Mechanical', 'backlight': 'False'}
  
  [VolumeDownButton]
  Type = DutPhysicalButton
  Position = [-0.643, 72.726, -3.916]
  Normal = [-1.0, 0.0, 0.0]
  Data = {'button_type': 'Mechanical', 'backlight': 'False'}
  
  [VolumeUpButton]
  Type = DutPhysicalButton
  Position = [-0.643, 58.564, -4.052]
  Normal = [-1.0, 0.0, 0.0]
  Data = {'button_type': 'Mechanical', 'backlight': 'False'}
  
  [ActionButton]
  Type = DutPhysicalButton
  Position = [68.748, 89.732, -3.968]
  Normal = [1.0, 0.0, 0.0]
  Data = {'button_type': 'Mechanical', 'backlight': 'False'}
  
  [AmbientLightSensor]
  Type = DutSensor
  Position = [35.7, 8.27, 4.1]
  Normal = [0.0, 0.0, 1.0]
  
  [Bluetooth]
  Type = DutSensor
  Data = {'id': 1}
  
  [CameraTorch]
  Type = DutSensor
  Position = [58.05, 27.63, -2.05]
  Normal = [0.0, 0.0, -1.0]
  
  [MotionSensors]
  Type = DutSensor
  Data = {'accelerometer': 'True', 'gyroscope': 'True', 'magnetometer': 'True'}
  
  #[PressureSensor]
  #Type = DutSensor
  #Data = {'id': 1}
  
  [VibrationEngine]
  Type = DutSensor
  Position = [35.7, 124.97, -4.1]
  Normal = [0.0, 0.0, -1.0]
  
  [ProximitySensor]
  Type = DutSensor
  Position = [35.7, 8.27, 4.1]
  Normal = [0.0, 0.0, 1.0]
  
  [Speaker1]
  Type = DutSensor
  Position = [35.7, 7.28, 4.1]
  Normal = [0.0, 0.0, 1.0]
  Data = {'id': 0, 'speaker_type': 'Receiver', 'volume': 0.9}
  
  [Speaker2]
  Type = DutSensor
  Position = [35.7, 140.9, 0.0]
  Normal = [0.0, 1.0, 0.0]
  Data = {'id': 1, 'speaker_type': 'Loudspeaker', 'volume': 1.0}
  
  [Mic0]
  Type = DutSensor
  Data = {'id': 0}
  
  [Mic1]
  Type = DutSensor
  Data = {'id': 1}
  
  [Truedepth]
  Type = DutSensor
  Position = [35.7, 8.27, 4.1]
  Normal = [0.0, 0.0, 1.0]
  Data = {'id': '0'}
  
  [FrontCamera0]
  Type = DutSensor
  Position = [35.7, 8.27, 4.1]
  Normal = [0.0, 0.0, 1.0]
  Data = {'id': '0', 'camera_type': 'fixed'}
  
  [BackCamera0]
  Type = DutSensor
  Position = [58.05, 17.63, -2.05]
  Normal = [0.0, 0.0, -1.0]
  Data = {'id': '0', 'camera_type': 'wide', 'logical': 'False'}
  
  [BackCamera1]
  Type = DutSensor
  Position = [58.05, 27.63, -2.05]
  Normal = [0.0, 0.0, -1.0]
  Data = {'id': '1', 'camera_type': 'ultra', 'logical': 'False'}
  
  [BackCamera2]
  Type = DutSensor
  Position = [58.05, 37.63, -2.05]
  Normal = [0.0, 0.0, -1.0]
  Data = {'id': '2', 'camera_type': 'tele', 'logical': 'False'}
  
  [Display]
  Type = DutSensor
  Data = {'display_type': 'OLED', 'edge_width': 0, 'exposure_time': 33330.0}
  
  [SilentSwitch]
  Type = DutPhysicalButton
  Position = [-0.643, 35.564, -3.968]
  Normal = [-1.0, 0.0, 0.0]
  Data = {'button_type': 'Mechanical'}
  
  [Wifi]
  Type = DutSensor
  Data = {'id': 1}
  
  [GPS]
  Type = DutSensor
  Data = {'id': 0}
  
  [LiDAR]
  Type = DutSensor
  Position = [58.05, 47.63, -2.05]
  Normal = [0.0, 0.0, -1.0]
  Data = {'id': '0'}`,
  
    "Pixel 8": `[General]
  Name = Pixel 8
  Version = 5
  
  [Dimensions]
  Dut_width = 70.8
  Dut_height = 150.5
  Width = 69.8
  Height = 149.5
  Offset_width = 0.5
  Offset_height = 0.5
  Thickness = 8.9
  
  [SIM]
  Type = DutSensor
  Data = {'id': 1}
  
  [PowerButton]
  Type = DutPhysicalButton
  Position = [67.8, 50.5, -4.45]
  Normal = [1.0, 0.0, 0.0]
  Data = {'button_type': 'Mechanical', 'backlight': 'False'}
  
  [VolumeDownButton]
  Type = DutPhysicalButton
  Position = [67.8, 70.5, -4.45]
  Normal = [1.0, 0.0, 0.0]
  Data = {'button_type': 'Mechanical', 'backlight': 'False'}
  
  [VolumeUpButton]
  Type = DutPhysicalButton
  Position = [67.8, 60.5, -4.45]
  Normal = [1.0, 0.0, 0.0]
  Data = {'button_type': 'Mechanical', 'backlight': 'False'}
  
  [AmbientLightSensor]
  Type = DutSensor
  Position = [35.4, 10.0, 4.45]
  Normal = [0.0, 0.0, 1.0]
  
  [Bluetooth]
  Type = DutSensor
  Data = {'id': 1}
  
  #[CameraTorch]
  #Type = DutSensor
  #Position = [52.0, 20.0, -4.45]
  #Normal = [0.0, 0.0, -1.0]
  
  [MotionSensors]
  Type = DutSensor
  Data = {'accelerometer': 'True', 'gyroscope': 'True', 'magnetometer': 'True'}
  
  [VibrationEngine]
  Type = DutSensor
  Position = [35.4, 120.0, -4.45]
  Normal = [0.0, 0.0, -1.0]
  
  [ProximitySensor]
  Type = DutSensor
  Position = [35.4, 10.0, 4.45]
  Normal = [0.0, 0.0, 1.0]
  
  [Speaker1]
  Type = DutSensor
  Position = [35.4, 10.0, 4.45]
  Normal = [0.0, 0.0, 1.0]
  Data = {'id': 0, 'speaker_type': 'Receiver', 'volume': 0.9}
  
  [Speaker2]
  Type = DutSensor
  Position = [35.4, 140.0, 0.0]
  Normal = [0.0, 1.0, 0.0]
  Data = {'id': 1, 'speaker_type': 'Loudspeaker', 'volume': 1.0}
  
  [Mic0]
  Type = DutSensor
  Data = {'id': 0}
  
  [Mic1]
  Type = DutSensor
  Data = {'id': 1}
  
  [FrontCamera0]
  Type = DutSensor
  Position = [35.4, 10.0, 4.45]
  Normal = [0.0, 0.0, 1.0]
  Data = {'id': '0', 'camera_type': 'fixed'}
  
  [BackCamera0]
  Type = DutSensor
  Position = [52.0, 20.0, -4.45]
  Normal = [0.0, 0.0, -1.0]
  Data = {'id': '0', 'camera_type': 'wide', 'logical': 'False'}
  
  [BackCamera1]
  Type = DutSensor
  Position = [52.0, 30.0, -4.45]
  Normal = [0.0, 0.0, -1.0]
  Data = {'id': '1', 'camera_type': 'ultra', 'logical': 'False'}
  
  [Display]
  Type = DutSensor
  Data = {'display_type': 'OLED', 'edge_width': 0, 'exposure_time': 33330.0}
  
  [Wifi]
  Type = DutSensor
  Data = {'id': 1}
  
  [GPS]
  Type = DutSensor
  Data = {'id': 0}`
  };
  