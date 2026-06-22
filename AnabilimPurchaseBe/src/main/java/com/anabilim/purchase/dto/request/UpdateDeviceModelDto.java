package com.anabilim.purchase.dto.request;

import lombok.Data;

@Data
public class UpdateDeviceModelDto {
    private String name;
    private String brand;
    private Boolean enableIp;
    private Boolean enableMac;
}
