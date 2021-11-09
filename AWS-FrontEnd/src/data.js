export const Card = (rank, suit) => {
  return { rank: rank, suit: suit };
};
export const PWMD = (duty, freq, sw) => {
  return { duty: duty, freq: freq, sw: sw };
};
export const PotD = (wiper, sw, monitor) => {
  return { wiper: wiper, sw: sw, monitor: monitor };
};

export const Duty = (value, error, helperText) => {
  return { value: value, error: error, helperText: helperText };
};
export const Freq = (value, error, helperText) => {
  return { value: value, error: error, helperText: helperText };
};
export const SW = (value, meta) => {
  return { value: value, meta: meta };
};

export const Wiper = (value, error, helperText) => {
  return { value: value, error: error, helperText: helperText };
};
export const Monitor = (voltage, current) => {
  return { voltage: voltage, current: current };
};

export function CANData(ID, Count, LEN, B0, B1, B2, B3, B4, B5, B6, B7) {
  return { ID, Count, LEN, B0, B1, B2, B3, B4, B5, B6, B7 };
}

export function CANGenData(
  id,
  ThreadID,
  enabled,
  ThreadName,
  num_messages,
  message_index,
  transmit_number,
  cycle_count,
  channel,
  tx_period,
  tx_delay,
  stop_after_count,
  extended,
  ID,
  DLC,
  B0,
  B1,
  B2,
  B3,
  B4,
  B5,
  B6,
  B7
) {
  return {
    id,
    ThreadID,
    enabled,
    ThreadName,
    num_messages,
    message_index,
    transmit_number,
    cycle_count,
    channel,
    tx_period,
    tx_delay,
    stop_after_count,
    extended,
    ID,
    DLC,
    B0,
    B1,
    B2,
    B3,
    B4,
    B5,
    B6,
    B7,
  };
}

export const pwm1 = PWMD(
  Duty(50, false, "test_child"),
  Freq(331, false, "test_child"),
  SW(false, "test_child")
);
export const pwm2 = PWMD(
  Duty(50, false, "test_child"),
  Freq(331, false, "test_child"),
  SW(false, "test_child")
);
export const pwm3 = PWMD(
  Duty(50, false, "test_child"),
  Freq(331, false, "test_child"),
  SW(false, "test_child")
);
export const pwm4 = PWMD(
  Duty(50, false, "test_child"),
  Freq(331, false, "test_child"),
  SW(false, "test_child")
);
export const pwm5 = PWMD(
  Duty(50, false, "test_child"),
  Freq(331, false, "test_child"),
  SW(false, "test_child")
);
export const pwm6 = PWMD(
  Duty(50, false, "test_child"),
  Freq(331, false, "test_child"),
  SW(false, "test_child")
);



export const pot1 = PotD(
  Wiper(1, false, "test_child"),
  SW(false, "test_child"),
  Monitor(0, 0)
);
export const pot2 = PotD(
  Wiper(2, false, "test_child"),
  SW(false, "test_child"),
  Monitor(0, 0)
);
export const pot3 = PotD(
  Wiper(3, false, "test_child"),
  SW(false, "test_child"),
  Monitor(0, 0)
);
export const pot4 = PotD(
  Wiper(4, false, "test_child"),
  SW(false, "test_child"),
  Monitor(0, 0)
);
