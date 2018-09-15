import {MinecraftLibrary, StepCallback} from "./MinecraftUtil";
import {Paths} from "./Constants";

import * as fetch from 'node-fetch';
import * as signale from 'signale';
import * as jfs from 'fs-jetpack';
import * as path from 'path';

const log = signale.scope("minecraft", "installer", "forge");

const fs = jfs.dir(path.join(Paths.APPDATA.toString(), 'minecraft'));

interface MavenRepo {
    readonly url: String;
    readonly artifacts: Artifacts;
}

export class LibraryHelper {

    public static getUrl(artifact: Artifact, repo: MavenRepo): ArtifactUrl {
        let groupId: string = artifact[0].replace(/\./g, '/');
        let artifactId: string = artifact[1];
        let versionId: string = artifact[2].toString();
        let type: string;
        if(artifact.length > 3)
            type = artifact[3];
        let path = `${groupId}/${artifactId}/${versionId}/${artifactId}-${versionId}${type ? '-' + type : ''}.jar`;
        return [
            `${repo.url}/${path}`,
            path
        ];
    }

    public static getUrls(repo: MavenRepo): ArtifactUrls {
        let result: ArtifactUrls = [];
        for(let i = 0; i < repo.artifacts.length; i++)
            result.push(LibraryHelper.getUrl(repo.artifacts[i], repo));
        return result;
    }

    public static async getLibrary(artifact: ArtifactUrl): Promise<MinecraftLibrary> {
        let url: string = artifact[0];
        let path: string = artifact[1];
        let res: fetch.Response = await fetch.default(url + ".sha1");
        log.debug(`${url}.sha1`);
        let hash: string = await res.text();
        log.debug(` -> ${hash}`);
        return new MinecraftLibrary(false, hash, 'libraries/' + path, url);
    }

    public static async getLibraries(version: string, c: StepCallback): Promise<MinecraftLibrary[]> {
        log.info("Getting Forge Library info!");
        let result: ArtifactUrls = [];
        for(let i = 0; i < repositories.length; i++) {
            let repo: MavenRepo = repositories[i];
            log.info(`Repo Info: '${repo.url}'`);
            result.push(...LibraryHelper.getUrls(repo))
        }
        c.steps(result.length + 3);
        let libs: MinecraftLibrary[] = [];
        for(let i = 0; i < result.length; i++) {
            let artifact: ArtifactUrl = result[i];
            log.debug(`Artifact Info: '${artifact[1]}'`);
            libs.push(await this.getLibrary(artifact));
            c.next();
        }
        let wrap: any[] = [];
        for(let i = 0; i < libs.length; i++)
            wrap.push(libs[i].wrap());
        await fs.writeAsync(`versions/${version}/${version}-forge.json`, wrap, {jsonIndent: 4});
        c.next();
        return libs;
    }

}

export class Maven1 implements MavenRepo {
    url: String = "https://repo1.maven.org/maven2";
    artifacts: Artifacts = [
        ["org.ow2.asm", "asm-all", "5.2"],
        ["org.apache.maven", "maven-artifact", "3.5.3"]
    ];
}

export class MavenCentral implements MavenRepo {
    url: String = "http://central.maven.org/maven2";
    artifacts: Artifacts = [
        ["org.scala-lang.plugins", "scala-continuations-library_2.11", "1.0.2"],
        ["org.scala-lang.plugins", "scala-continuations-plugin_2.11.1", "1.0.2"],
        ["org.scala-lang", "scala-actors-migration_2.11", "1.1.0"],
        ["org.scala-lang", "scala-compiler", "2.11.1"],
        ["org.scala-lang", "scala-library", "2.11.1"],
        ["org.scala-lang", "scala-reflect", "2.11.1"],
        ["org.scala-lang.modules", "scala-parser-combinators_2.11", "1.0.1"],
        ["org.scala-lang.modules", "scala-swing_2.11", "1.0.1"],
        ["org.scala-lang.modules", "scala-xml_2.11", "1.0.2"],

        ["com.typesafe", "config", "1.2.1"],
        ["com.typesafe.akka", "akka-actor_2.11", "2.3.3"],

        ["net.sf.trove4j", "trove4j", "3.0.3"],
        ["javax.vecmath", "vecmath", "1.5.2"]
            //'javax.vecmath', name: 'vecmath', version: '1.5.2'
    ];
}

export class GeotoolkitMaven implements MavenRepo { //Geotoolkit is dead
    url: string = "http://maven.geotoolkit.org";
    artifacts: Artifacts = [
        ["java3d", "vecmath", "1.5.2"]
    ];

}

export class MinecraftLibraries implements MavenRepo {
    url: String = "https://libraries.minecraft.net";
    artifacts: Artifacts = [
        ["net.minecraft", "launchwrapper", "1.12"]
    ];//https://libraries.minecraft.net/net/minecraft/launchwrapper/1.12/launchwrapper-1.12.jar

}

export class SpongeMaven implements MavenRepo { // Because why tf not?
    url: String = "https://repo.spongepowered.org/maven";
    artifacts: Artifacts = [
        ["lzma", "lzma", "0.0.1"]
    ]

}

export class ForgeFiles implements MavenRepo {
    url: String = "https://files.minecraftforge.net/maven";
    artifacts: Artifacts = [
        ["net.minecraftforge", "forge", "1.12.2-14.23.4.2759", "universal"]
    ];
}

const repositories: MavenRepos = [
    new MinecraftLibraries(),
    //new GeotoolkitMaven(), //Geotoolkit is dead
    new MavenCentral(),
    new SpongeMaven(),
    new Maven1()
];

//              group,   artifact,   version,     type
type Artifact = [string, string, string | number, string?];
type Artifacts = Artifact[];
type MavenRepos = MavenRepo[];

//                 url,     path
export type ArtifactUrl = [string, string];
export type ArtifactUrls = [string, string][];