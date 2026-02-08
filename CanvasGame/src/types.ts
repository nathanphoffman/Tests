
export type MultipleOf32 = number;
export type Multiplier = number;

export type Config = {
    SIZE: 64,
    WIDTH: MultipleOf32,
    HEIGHT: MultipleOf32,
    SCALE: Multiplier
}

export type XAxis = number;
export type YAxis = number;

export type Coord = [XAxis, YAxis];