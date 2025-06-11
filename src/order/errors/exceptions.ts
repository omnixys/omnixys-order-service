import { HttpException, HttpStatus } from '@nestjs/common';

export class EmailExistsException extends HttpException {
  constructor(email: string) {
    super(
      `The email address: ${email} already exists.`,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

/**
 * Exception class for an invalid version number during update.
 */
export class InvalidVersionException extends HttpException {
  constructor(version: number | undefined) {
    super(
      `Die Versionsnummer ${version} existiert nicht.`,
      HttpStatus.PRECONDITION_FAILED,
    );
  }
}

/**
 * Exception class for an outdated version number during update.
 */
export class OutdatedVersionException extends HttpException {
  constructor(version: number) {
    super(
      `Die Versionsnummer ${version} ist veraltet.`,
      HttpStatus.PRECONDITION_FAILED,
    );
  }
}

export class InvalidPatchOperationException extends HttpException {
  constructor(value: string | undefined) {
    super(`${value}`, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

export class ContactExistsException extends HttpException {
  constructor({ name, firstName }: { name: string; firstName: string }) {
    super(
      `The authorized person ${name} ${firstName} already exists.`,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

export class VersionInvalidException extends HttpException {
  constructor(version: string | undefined) {
    super(
      `Die Versionsnummer ${version} ist ungueltig.`,
      HttpStatus.PRECONDITION_FAILED,
    );
  }
}

/**
 * Exception-Klasse für eine veraltete Versionsnummer beim Ändern.
 */
export class VersionOutdatedException extends HttpException {
  constructor(version: number) {
    super(
      `Die Versionsnummer ${version} ist nicht aktuell.`,
      HttpStatus.PRECONDITION_FAILED,
    );
  }
}

/**
 * Das Modul besteht aus den Klassen für die Fehlerbehandlung bei der Verwaltung
 * von Büchern, z.B. beim DB-Zugriff.
 * @packageDocumentation
 */

/**
 * Exception-Klasse für eine bereits existierende ISBN-Nummer.
 */
export class NameExistsException extends HttpException {
  override readonly name: string;

  constructor(name: string) {
    super(
      `Der Produktname ${name} existiert bereits.`,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
    this.name = name;
  }
}
