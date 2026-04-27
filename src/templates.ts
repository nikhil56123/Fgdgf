import { ModProject } from './store';

export const FORGE_TEMPLATE: ModProject = {
  id: '',
  name: 'MyForgeMod',
  version: '1.0.0',
  mcVersion: '1.20.1',
  modType: 'forge',
  files: [
    {
      name: 'ExampleMod.java',
      language: 'java',
      content: `package com.example.examplemod;

import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.fml.event.lifecycle.FMLCommonSetupEvent;
import net.minecraftforge.fml.javafmlmod.FMLJavaModLoadingContext;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

@Mod("examplemod")
public class ExampleMod {
    private static final Logger LOGGER = LogManager.getLogger();

    public ExampleMod() {
        FMLJavaModLoadingContext.get().getModEventBus().addListener(this::setup);
    }

    private void setup(final FMLCommonSetupEvent event) {
        LOGGER.info("HELLO FROM FORGE SETUP");
    }
}`
    },
    {
      name: 'mods.toml',
      language: 'json',
      content: `modLoader="javafml"
loaderVersion="[1]"
license="MIT"

[[mods]]
modId="examplemod"
version="1.0.0"
displayName="Example Mod"
description="''"
authors="You"
`
    }
  ],
  models: {
    'ExampleCube': [
        { id: '1', position: [0, 0, 0], color: '#3f633d' }
    ]
  }
};

export const FABRIC_TEMPLATE: ModProject = {
  id: '',
  name: 'MyFabricMod',
  version: '1.0.0',
  mcVersion: '1.20.1',
  modType: 'fabric',
  files: [
    {
      name: 'ExampleMod.java',
      language: 'java',
      content: `package net.fabricmc.example;

import net.fabricmc.api.ModInitializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ExampleMod implements ModInitializer {
    public static final Logger LOGGER = LoggerFactory.getLogger("modid");

    @Override
    public void onInitialize() {
        LOGGER.info("Hello Fabric world!");
    }
}`
    },
    {
      name: 'fabric.mod.json',
      language: 'json',
      content: `{
  "schemaVersion": 1,
  "id": "modid",
  "version": "1.0.0",
  "name": "Example Mod",
  "entrypoints": {
    "main": [
      "net.fabricmc.example.ExampleMod"
    ]
  }
}`
    }
  ],
  models: {}
};

export const NEOFORGE_TEMPLATE: ModProject = {
  id: '',
  name: 'MyNeoForgeMod',
  version: '1.0.0',
  mcVersion: '1.20.4',
  modType: 'neoforge',
  files: [
    {
      name: 'ExampleMod.java',
      language: 'java',
      content: `package com.example.examplemod;

import net.neoforged.bus.api.IEventBus;
import net.neoforged.fml.common.Mod;
import net.neoforged.fml.event.lifecycle.FMLCommonSetupEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Mod("examplemod")
public class ExampleMod {
    private static final Logger LOGGER = LoggerFactory.getLogger(ExampleMod.class);

    public ExampleMod(IEventBus modEventBus) {
        modEventBus.addListener(this::setup);
    }

    private void setup(final FMLCommonSetupEvent event) {
        LOGGER.info("HELLO FROM NEOFORGE SETUP");
    }
}`
    },
    {
      name: 'neoforge.mods.toml',
      language: 'json',
      content: `modLoader="javafml"
loaderVersion="[1]"
license="MIT"

[[mods]]
modId="examplemod"
version="1.0.0"
displayName="Example Mod"
`
    }
  ],
  models: {}
};

export const QUILT_TEMPLATE: ModProject = {
  id: '',
  name: 'MyQuiltMod',
  version: '1.0.0',
  mcVersion: '1.20.1',
  modType: 'quilt',
  files: [
    {
      name: 'ExampleMod.java',
      language: 'java',
      content: `package net.quiltmc.example;

import org.quiltmc.loader.api.ModContainer;
import org.quiltmc.qsl.base.api.entrypoint.ModInitializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ExampleMod implements ModInitializer {
    public static final Logger LOGGER = LoggerFactory.getLogger("modid");

    @Override
    public void onInitialize(ModContainer mod) {
        LOGGER.info("Hello Quilt world!");
    }
}`
    },
    {
      name: 'quilt.mod.json',
      language: 'json',
      content: `{
  "schema_version": 1,
  "quilt_loader": {
    "group": "net.quiltmc.example",
    "id": "modid",
    "version": "1.0.0",
    "metadata": {
      "name": "Example Mod"
    },
    "intermediate_mappings": "net.fabricmc:intermediary",
    "entrypoints": {
      "main": "net.quiltmc.example.ExampleMod"
    }
  }
}`
    }
  ],
  models: {}
};
