import random
import pedalboard_native

class Pedal():
    def __init__(self, order, params, pedal_class):
        self.order = order
        self.params = params
        self.pedal = pedal_class(**params)

    def get_params(self):
        return self.params
    
    def get_pedal(self):
        return self.pedal

class Distortion(Pedal):
    def __init__(self):
        super().__init__(
            order=0,
            params=self.get_params(),
            pedal_class=pedalboard_native.Distortion
        )

    def get_params(self):
        return {"drive_db": random.randint(0, 20)}

class Phaser(Pedal):
    def __init__(self):
        super().__init__(
            order=1,
            params=self.get_params(),
            pedal_class=pedalboard_native.Phaser
        )

    def get_params(self):
        return {
            "rate_hz": random.uniform(0.1, 10.0),
            "depth": random.uniform(0.0, 1.0),
            "centre_frequency_hz": random.uniform(100.0, 10000.0),
            "feedback": 0.0,
            "mix": 0.5
        }

class Chorus(Pedal):
    def __init__(self):
        super().__init__(
            order=2,
            params=self.get_params(),
            pedal_class=pedalboard_native.Chorus
        )

    def get_params(self):
        return {
            "rate_hz": random.uniform(0.1, 2.0),
            "depth": random.uniform(0.0, 0.5),
            "centre_delay_ms": random.uniform(5.0, 30.0),
            "feedback": 0.0,
            "mix": 0.5
        }

class Bitcrush(Pedal):
    def __init__(self):
        super().__init__(
            order=3,
            params=self.get_params(),
            pedal_class=pedalboard_native.Bitcrush
        )

    def get_params(self):
        return {"bit_depth": 8 + 8 * random.randint(0, 1)}

class Delay(Pedal):
    def __init__(self):
        super().__init__(
            order=4,
            params=self.get_params(),
            pedal_class=pedalboard_native.Delay
        )

    def get_params(self):
        return {
            "delay_seconds": random.uniform(0.01, 1.0),
            "feedback": 0.0,
            "mix": 0.5
        }

class Reverb(Pedal):
    def __init__(self):
        super().__init__(
            order=5,
            params=self.get_params(),
            pedal_class=pedalboard_native.Reverb
        )

    def get_params(self):
        return {
            "room_size": random.uniform(0.0, 1.0),
            "damping": random.uniform(0.0, 1.0),
            "wet_level": random.uniform(0.0, 1.0),
            "dry_level": random.uniform(0.0, 1.0),
            "width": random.uniform(0.0, 1.0),
            "freeze_mode": random.uniform(0.0, 1.0)
        }